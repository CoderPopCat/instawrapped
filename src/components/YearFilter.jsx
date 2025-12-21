import React from 'react'

function YearFilter({ availableYears, selectedYear, onYearChange }) {
    if (!availableYears || availableYears.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center items-center gap-3 mb-6 mt-4">
            <button
                onClick={() => onYearChange(null)}
                className={`pill-button px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedYear === null
                        ? 'bg-[#06f] border-[#06f] text-white'
                        : 'bg-[#ffffff0d] border-[#1b1f23] text-gray-300 hover:bg-[#1b1f23]'
                }`}
            >
                All Time
            </button>
            {availableYears.map((year) => (
                <button
                    key={year}
                    onClick={() => onYearChange(year)}
                    className={`pill-button px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedYear === year
                            ? 'bg-[#06f] border-[#06f] text-white'
                            : 'bg-[#ffffff0d] border-[#1b1f23] text-gray-300 hover:bg-[#1b1f23]'
                    }`}
                >
                    {year}
                </button>
            ))}
        </div>
    )
}

export default YearFilter;

