const categories = [
    'All',
    'Bridal',
    'Evening',
    'Luxury',
];

type Props = {
    active: string;
    onSelect: (category: string) => void;
};

export default function CategoryFilter({
    active,
    onSelect,
}: Props) {
    return (
        <div className="mb-12 flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`rounded-full px-6 py-2 transition ${active === category
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-300 bg-white'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}