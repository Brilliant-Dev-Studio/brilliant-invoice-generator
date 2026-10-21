export function inputValidationMessage(validity: ValidityState): string {
  if (validity.valueMissing) return "This field is required.";
  if (validity.typeMismatch) return "Enter a valid email address or URL.";
  if (validity.rangeUnderflow || validity.rangeOverflow)
    return "Enter a value within the allowed range.";
  if (validity.tooShort || validity.tooLong)
    return "Check the length of this value.";
  if (validity.stepMismatch || validity.badInput)
    return "Enter a valid number with the allowed precision.";
  return "Check this field's format.";
}
