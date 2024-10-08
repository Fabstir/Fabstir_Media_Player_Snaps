export default function useMaths() {
  const epsilon = 1e-10;

  const isEpsilon = (number) => {
    if (Math.abs(number) < epsilon) return true;
    else return false;
  };

  return { isEpsilon, epsilon };
}
