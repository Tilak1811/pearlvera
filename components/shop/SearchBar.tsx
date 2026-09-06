type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function SearchBar({
    value,
    onChange,
}: SearchBarProps) {
    return (
        <div className="mx-auto mb-10 max-w-lg">
            <input
                type="text"
                placeholder="Search handbags..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-full border border-stone-300 bg-white px-6 py-4 text-stone-900 shadow-sm outline-none focus:border-stone-600"
            />
        </div>
    );
}