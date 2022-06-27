//////////////////////////////////////////////////////////////
//////////////////////// Variables ///////////////////////////
//////////////////////////////////////////////////////////////

let fullData = undefined;
let sortAscending = false;
let sortColumn = 1; // PlanetName

let rowsToShow = [];
let dataToShow = [];
const ColumnsToSkip = ['hostname', 'pl_name', 'name', 'id']; // To skip in renderings

const NAME_COLUMN = 'pl_name';
const LINE_OPACITY = 0.5;

// Status variables
let brushSelection = undefined;
let activeItemId = undefined; // id of highlighted item

//////////////////////////////////////////////////////////////
////////////////////  Read data   ////////////////////////////
//////////////////////////////////////////////////////////////
function loadData() {
  // Note that the data variable was created in the data preparation step and 
  // is available in a separate js file
  var row = 0;

  // Create a unique id for each item
  data.forEach((d) => { d.id = row; row++; });

  // Remove som non-interesting or problematic columns
  const columnsToRemove = [
    'rastr', 'decstr', 'ed_ESM', 'sy_refname', 'pl_refname', 'st_refname',
    'dt_obj', 'pl_rprs2', 'tran_flag', 'soltype', 'disc_facility', 'gaia_id',
    'pl_bmassprov', 'default_flag', 'ttv_flag', 'pl_radj', 'pl_bmassj',
  ];
  const selectedData = data.map(item => {
    let newEntry = {};
    for (const key in item) {
      // Uncertainty and limits
      if (key.endsWith("err1") || 
          key.endsWith("err2") || 
          key.endsWith("lim") || 
          key.endsWith("apogee") || // for now, skip metallicity cols
          key.endsWith("galah") || // for now, skip metallicity cols
          key.startsWith("molecule") || // and molecule columns
          columnsToRemove.includes(key)) 
      {
        continue;
      }
      newEntry[key] = item[key];
    }
    return newEntry;
  });

  fullData = selectedData;
  dataToShow = fullData;

  // For testing: reduce number of data points to max 200
  //dataToShow = dataToShow.slice(0, 200);

  // Initialize column selection
  let count = 0;
  for (const key in dataToShow[0]) {
    if (ColumnsToSkip.includes(key)) {
      continue;
    }
    parallelColumnSelection[key] = key.startsWith("pl_"); // enable planet columns per default
    matrixColumnSelection[key] = false;
    count++;
  }
  // Default matrix columns
  matrixColumnSelection.ESM = true;
  matrixColumnSelection.TSM = true;
  matrixColumnSelection.pl_Teq = true;
  matrixColumnSelection.pl_rade = true;

  // Some non-planet default PC columns
  const pcDefaultColumns = ["sy_snum", "sy_pnum", "ESM", "TSM"]
  pcDefaultColumns.forEach(col => {
    parallelColumnSelection[col] = true;
  })
  // Special: disable pl_pubdate and pl_eqt
  parallelColumnSelection.pl_pubdate = false;
  parallelColumnSelection.pl_eqt = false;

  // Setup
  renderColumnSelection();
  populateColorChoiceList();
  updateColorMap();

  // Also update the charts based on the data
  updateCharts();
}

async function updateFromOpenSpace() {
  if (!openspace) {
    return;
  }
  let result = await openspace.getPropertyValue("Modules.ExoplanetsExpertTool.FilteredDataRows");
  rowsToShow = Object.values(result);

  dataToShow = fullData;

  // If we have a selection from OpenSpace, use that one
  if (rowsToShow.length > 0) {
    dataToShow = dataToShow.filter((d) => { return rowsToShow.includes(d.id); });
  }

  updateColorMap();
  updateCharts();
}

async function setSelectionInOpenSpace() {
  if (!openspace) {
    return;
  }
  console.log("Send selection to OpenSpace");
  const valueToSend = brushSelection ? brushSelection : {};
  openspace.setPropertyValueSingle(
    "Modules.ExoplanetsExpertTool.ExoplanetsToolGui.DataViewer.ExternalSelection",
    valueToSend
  );
}

//////////////////////////////////////////////////////////////
//////////////////// Draw the Table //////////////////////////
//////////////////////////////////////////////////////////////
const tableHeaders = [ "ID", "Planet", "TSM", "ESM", "R" ];
const tableDataFromItem = (d) => {
  return [d.id, d.pl_name, d.TSM, d.ESM, d.pl_rade];
};

function sortDataFromTableOrder() {
  console.log("re-sorting");
  // Sort data based on current sort column
  dataToShow.sort(function(d1, d2) {
    const a = tableDataFromItem(d1);
    const b = tableDataFromItem(d2);
    const c = sortColumn;

    if (isNaN(a[c]) && isNaN(b[c])) { // string
      // Note flipped order for strings
      return sortAscending ? 
        d3.descending(a[c].toLowerCase(), b[c].toLowerCase()) :
        d3.ascending(a[c].toLowerCase(), b[c].toLowerCase());
    } 
    else { // number
      let l = Number.parseFloat(a[c]);
      let r = Number.parseFloat(b[c]);

      // Always put NaN values at the very end
      if (isNaN(l)) {
        return 1;
      }
      if (isNaN(r)) {
        return -1;
      }

      return sortAscending ? d3.ascending(l, r) : d3.descending(l, r);
    }
  });
}

// OBS! Assumes the first item is an ID
function drawMetaDataTable() {
  let dataRows = dataToShow.map(d => tableDataFromItem(d));

  // Filter based on brush selection
  if (brushSelection) {
    dataRows = dataRows.filter(d => brushSelection.includes(d[0])); // First col is the id
  }

  document.getElementById('metaTableInfo').innerHTML = `<p>Selection: ${dataRows.length} planets</p>`

  // Remove whatever content was present in the div before
  d3.select('#metaTableContainer').selectAll("*").remove();

  let table = d3.select('#metaTableContainer').append('table')
    .style("border-collapse", "collapse")
    .style("width", "90%")
    .style("text-align", "left");

  // Headers
  let header = table.append("thead").append("tr")
  let headers = header.selectAll("th")
    .data(tableHeaders.slice(1)) // remove first col
    .enter().append("th")
    .text(function(d) { return d; })
    .style("border", "1px darkgray solid")
    .style("padding", "5px")
    .style("background-color", "lightgray")
    .style("font-weight", "bold");

  // Sorting
  headers
    .on("click", function(event, col) {
      const prevSortColumn = sortColumn;
      sortColumn = tableHeaders.indexOf(col);

      if (prevSortColumn !== sortColumn) {
        sortAscending = false;
      }
      else {
        sortAscending = !sortAscending;
      }
      sortDataFromTableOrder();
      drawMetaDataTable(); // updateCharts(); // For now we only want to update the table
    });

  function planetBinViz(planetRadius) {
    const size = 11;
    const planetBinDomain = [1.5, 2.75, 4.0, 10.0];

    const rScale = d3.scaleThreshold()
      .domain(planetBinDomain) // planet bin top
      .range([3, 5, 7, 10, 12]);

    const colorScale = d3.scaleThreshold()
      .domain(planetBinDomain) // planet bin top
      .range(['#a6611a', '#80cdc1', '#018571', '#dfc27d', 'lightgray']);

    let safeColor = (r) => { return isNaN(parseFloat(r)) ? 'white' : colorScale(r); };

    return d3.select(this).append("svg").attr("width", 2 * size).attr("height", 2 * size)
      .append("circle")
      .style("fill", safeColor(planetRadius))
      .attr("r", rScale(planetRadius))
      .attr("cx", size)
      .attr("cy", size);  
  }

  let body = table.append("tbody");

  // Data
  let trows = body.selectAll("tr.tabledata")
    .data(dataRows)
    .enter().append("tr")
    .attr("class", "tabledata")
    .attr("id", row => `row-${row[0]}`) // first col is id
    .on("mouseover", function (event, row, i) {
      d3.select(this).classed("highlighted", true);
      onTableRowMouseOver(row[0]);
    })
    .on("mouseout", function (event, row, i) {
      d3.select(this).classed("highlighted", false);
      onTableRowMouseOut(row[0]);
    });

  trows.selectAll("td")
    .data(row => row.slice(1)) // remove first col
    .enter().append("td")
    .text(function(d) { 
      if (isNaN(d)) { 
        return d; 
      }
      // is a number
      return Number.parseFloat(d).toFixed(2);
    });

  // Add a column to show the planet bin viz
  header.append("th").text("");
  trows.selectAll("td.binViz") 
    .data(d => [d[4]]) // 4 is index of radius
    .enter()
    .append("td")
    .attr("class", "binViz")
    .each(planetBinViz);
}

//////////////////////////////////////////////////////////////
///////////// Functions for linked views /////////////////////
//////////////////////////////////////////////////////////////

// The id is always the row in the full data list

function buildItemTooltipHTML(id) {
  let item = fullData[id];
  return `${item.pl_name}`;
}

function setScatterPointHighlight(id, isHighlighted) {
  // Fade out or show the other points
  const othersOpacity = isHighlighted ? 0.0 : 1.0;
  const points = document.querySelectorAll(`.foregroundCircle:not(.scatterPoint-${id})`);
  if (points && points.length > 0) {
    points.forEach(p => { p.style.opacity = othersOpacity; });
  }
}

function setLineHighlight(id, isHighlighted) {
  // Fade out or show the other points
  const othersOpacity = isHighlighted ? 0.0 : LINE_OPACITY;
  const lines = document.querySelectorAll(`.parallelLine:not(#line-${id})`);
  if (lines && lines.length > 0) {
    lines.forEach(p => { p.style.opacity = othersOpacity; });
  }
}

function onTableRowMouseOver(id) {
  if (activeItemId !== undefined && activeItemId === id) {
    return; // Already set => do nothing
  }
  activeItemId = id;

  setLineHighlight(id, true);
  setScatterPointHighlight(id, true);
}

function onTableRowMouseOut(id) {
  if (activeItemId === undefined) {
    return; // Already reset => do nothing
  }
  activeItemId = undefined;

  setLineHighlight(id, false);
  setScatterPointHighlight(id, false);
}

function highlightTableRow(id) {
  // Hightlight table row
  let row = document.querySelector(`tr#row-${id}`);
  if (row) {
    row.classList.add("highlighted");
  }
}

function clearHighlightedTableRows() {
  // Hightlight table row
  let allItemsToClear = document.querySelectorAll(".highlighted");
  allItemsToClear.forEach(item => {
    item.classList.remove("highlighted");
  });
}

// Callback that is called when brushing the parallel coordinates
function onParallelBrush(selection) {
  brushSelection = selection; // Will be undefined if no brush

  // Of the color map should be set from thebrushing, make sure to update it
  if (alwaysSetColorFromSelection) {
    updateColorMap();
    updateChartColorMapping();
  }

  // Update the other two plots
  drawMetaDataTable();
  updateScatterPlotMatrix();
}

function onLineMouseOver(id, chartId) {
  if (activeItemId !== undefined && activeItemId === id) {
    return; // Already set => do nothing
  }
  activeItemId = id;

  highlightTableRow(id);
  setScatterPointHighlight(id, true);
}

function onLineMouseOut(id, chartId) {
  if (activeItemId === undefined) {
    return; // Already reset => do nothing
  }
  activeItemId = undefined;
  clearHighlightedTableRows();
  setScatterPointHighlight(id, false);
}

function onPointMouseOver(id, chartId) {
  if (activeItemId !== undefined && activeItemId === id) {
    return; // Already set => do nothing
  }
  activeItemId = id;

  highlightTableRow(id);
  setLineHighlight(id, true);
}

function onPointMouseOut(id, chartId) {
  if (activeItemId === undefined) {
    return; // Already reset => do nothing
  }
  activeItemId = undefined;
  clearHighlightedTableRows();
  setLineHighlight(id, false);
}


//////////////////////////////////////////////////////////////
//////////////////////// Update //////////////////////////////
//////////////////////////////////////////////////////////////

function updateChartColorMapping() {
  updateParallelLineColors("parallel_coords", colorFunction);
  // For now, update the entire scatterplot chart. Later we should just set the color correctly
  updateScatterPlotMatrix();
}

function updateParallelCoordinates() {
  let pcColumns = [];
  for (const [column, checked] of Object.entries(parallelColumnSelection)) {
    if (checked && !ColumnsToSkip.includes(column)) {
      pcColumns.push(column);
    }
  }

  const pcChartOptions = {
    w: 900,
    h: 300,
    // margin: margin,
    color: colorFunction,
    strokeWidth: 2,
    lineOpacity: LINE_OPACITY,
    onItemMouseOver: onLineMouseOver,
    onItemMouseOut: onLineMouseOut,
    buildItemTooltipHTML: buildItemTooltipHTML,
    // showDistribution: true,
    brushCallback: onParallelBrush,
    columns: pcColumns,
  };
  
  ParallelCoordinatesChart("parallel_coords", dataToShow, pcChartOptions);

  // Add double click listener to axis headers
  d3.select("#parallel_coords").selectAll(".legend")
    .on("dblclick", (event, d) => {
      colorColumn = d; 
      updateColorMap();
      updateChartColorMapping();
    })
}

function updateScatterPlotMatrix() {
  let matrixColumns = [];
  for (const [column, checked] of Object.entries(matrixColumnSelection)) {
    if (checked && !ColumnsToSkip.includes(column)) {
      matrixColumns.push(column);
    }
  }

  ScatterplotMatrix("scatter_plot_matrix", dataToShow, {
    columns: matrixColumns,
    colors: colorFunction, // switch to use same kind of color function as PC
    z: d => d.id, // Color column
    isFiltered: (id) => { 
      return brushSelection ? !brushSelection.includes(id) : false;
    },
    buildItemTooltipHTML: buildItemTooltipHTML,
    onItemMouseOver: onPointMouseOver, 
    onItemMouseOut: onPointMouseOut
  });

  // Add double click listener to axis headers
  d3.select("#scatter_plot_matrix").selectAll(".legend")
    .on("dblclick", (event, d) => {
      colorColumn = d; 
      updateColorMap();
      updateChartColorMapping();
    })
}

function updateCharts() {
  // This also sorts the dataToShow variable based on the table
  drawMetaDataTable();
  updateScatterPlotMatrix();
  updateParallelCoordinates();
}

// Setup:
loadData();
