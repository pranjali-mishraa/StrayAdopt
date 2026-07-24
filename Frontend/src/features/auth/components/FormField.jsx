export default function Field({ label, name, type, placeholder, value, onChange, error, autoComplete }) {
    return (
      <div>
        <label className="block text-[13px] font-medium text-text-mid mb-1.5">{label}</label>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full h-11 px-4 border rounded-xl text-[14px] --color-text-main outline-none transition-all duration-200 placeholder:--color-text-main-light
            ${error ? "border-red-400 ring-2 ring-red-100" : "border-border-brand focus:border-bark focus:ring-2 focus:ring-bark/20"}`}
        />
        {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
      </div>
    );
  }