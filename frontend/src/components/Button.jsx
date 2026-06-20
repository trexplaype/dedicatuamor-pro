import { Link } from "react-router-dom";

export default function Button({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
}) {
  const classes = `button button-${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
