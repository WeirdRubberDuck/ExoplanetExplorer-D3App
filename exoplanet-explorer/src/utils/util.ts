// Check is variable has a value
export function hasValue(value: number | string | null | undefined): boolean {
  // We want to allow zeros
  if (value === 0) {
    return true;
  } else if (value) {
    // Truthy values
    return true;
  } else {
    // Falsy values
    return false;
  }
}

export function compareArrays(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  else {
    // Comparing each element of your array
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
