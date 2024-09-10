export default function useMaths() {
  const isEpsilon = (number) => {
    if (Math.abs(number) < 1e-10) return true
    else return false
  }

  return { isEpsilon }
}
