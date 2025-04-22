export const Card = ({ children, ...props }) => (
  <div {...props} className={`${props.className} bg-gray-800 p-4 rounded-lg shadow`}>
    {children}
  </div>
);

export const CardContent = ({ children, ...props }) => (
  <div {...props} className={`${props.className}`}>
    {children}
  </div>
);
