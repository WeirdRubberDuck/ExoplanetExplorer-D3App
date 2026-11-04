import { useState } from 'react';
import { Alert, Box, FileInput, Group, Popover, Text, Tooltip } from '@mantine/core';

import { initializeData } from '@/redux/data/dataSlice';
import { useAppDispatch } from '@/redux/hooks';
import { parseDataset } from '@/utils/datasetParsing';

export function DataFileInput() {
  const dispatch = useAppDispatch();
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const rows = parseDataset(await file.text(), file.name);
      dispatch(initializeData({ rows, source: { kind: 'file', name: file.name } }));
      setLoadedFile(file);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read dataset file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group gap={'xs'}>
      <Text size={'sm'}>Load data:</Text>
      <Popover
        opened={Boolean(error)}
        onChange={(opened) => {
          if (!opened) setError(null);
        }}
        position={'bottom-end'}
        width={300}
        withinPortal
      >
        <Popover.Target>
          <Box>
            <Tooltip label={loadedFile?.name ?? 'Upload a CSV or JSON file'}>
              <FileInput
                aria-label={'Upload CSV or JSON'}
                aria-busy={loading}
                value={loadedFile}
                disabled={loading}
                error={Boolean(error)}
                onChange={(file) => {
                  if (file) void loadData(file);
                }}
                accept={'.csv,.json'}
                w={100}
              />
            </Tooltip>
          </Box>
        </Popover.Target>
        <Popover.Dropdown p={0} style={{ maxWidth: 'calc(100vw - 24px)' }}>
          <Alert
            color={'red'}
            title={'Dataset not loaded'}
            withCloseButton
            closeButtonLabel={'Dismiss dataset error'}
            onClose={() => setError(null)}
            role={'alert'}
            style={{ overflowWrap: 'anywhere' }}
          >
            {error}
          </Alert>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
