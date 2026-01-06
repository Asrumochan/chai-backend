/**
 * The function `WithConditional` conditionally renders the `children` based on the `when` boolean
 * value.
 * @param children - The `children` parameter in the `WithConditional` function is of type
 * `React.ReactNode`, which means it can accept any valid React node as its value. This can include JSX
 * elements, strings, numbers, arrays, fragments, etc.
 * @param {boolean} when - `when` is a boolean parameter that determines whether the `children` should
 * be rendered or not based on its value. If `when` is `true`, the `children` will be rendered,
 * otherwise it will not be rendered.
 * @returns The function `WithConditional` returns the `children` if the `when` condition is true,
 * otherwise it returns `undefined`.
 */
const WithConditional = ({ children, when }) => {
    return when ? children : null;
  };
  
  export default WithConditional;