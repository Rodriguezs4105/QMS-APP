import React from 'react';

const FormCard = ({ rank, title, user, avatarUrl, colorClass }) => (
    <div className={`rounded-2xl p-4 mb-3 shadow-lg flex items-center ${colorClass}`}>
        <img src={avatarUrl} alt="user avatar" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
        <div className="flex-grow ml-4">
            <p className="font-bold text-white text-lg truncate">{title}</p>
            <p className="text-white/80 text-sm">{user}</p>
        </div>
        <div className="text-center pl-2">
            <p className="font-bold text-white text-xl">{rank}</p>
            <p className="text-white/80 text-xs">Rank</p>
        </div>
    </div>
);

export default FormCard;
