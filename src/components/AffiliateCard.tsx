import React from 'react';

interface AffiliateCardProps {
  title: string;
  category: string;
  onFilter?: (category: string) => void;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({ title, category, onFilter }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-neutral-900 text-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <span 
          onClick={() => onFilter && onFilter(category)} 
          className="text-xs px-2 py-1 bg-amber-500 text-black rounded cursor-pointer"
        >
          {category}
        </span>
      </div>
      <p className="text-sm text-gray-400">ফিল্টার ট্যাব এবং ভিজুয়াল লেআউট আপডেট করা হয়েছে।</p>
    </div>
  );
};
