export default function AppContainer({ children, className = "" }) {
  return (
    <div className={`container-main ${className}`}>
      {children}
    </div>
  );
}