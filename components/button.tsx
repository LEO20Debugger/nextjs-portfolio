/**
 * Presentational only — this always renders inside a <Link>, so it must stay a
 * non-interactive element (a <button> inside an <a> is invalid). Hover state is
 * driven by the parent link's `group` class; the focus ring lives there too.
 */
const Button = ({
  text,
  secondaryText,
  color = "#070707",
}: {
  text: string;
  secondaryText?: string;
  color?: string;
}) => {
  return (
    <span
      style={{
        backgroundColor: color,
      }}
      className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white rounded-lg max-w-fit transition-all duration-200 ease-out group-hover:brightness-110 group-hover:scale-[1.04] group-hover:shadow-md group-active:scale-100"
    >
      <span>{text}</span>
      {secondaryText ? (
        <span className="font-light text-neutral-200">{secondaryText}</span>
      ) : null}
    </span>
  );
};

export default Button;
