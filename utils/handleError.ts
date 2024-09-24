export default function handleError(
  error: Error,
  setError: (error: string) => void
) {
  console.error(error);
  setError(error.message);
}
