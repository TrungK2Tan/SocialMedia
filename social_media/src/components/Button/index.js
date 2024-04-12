import React from 'react';

const Button = ({
    label = '',
    icon = '',
    className = '',
    onClick = () => console.log('Button clicked'), // Corrected onClick prop
    type = 'button',
    disabled = false
}) => {
    return (
        <button type={type} className={`bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-3xl ${className}`} onClick={onClick} disabled={disabled}> {/* Corrected onClick */}
            <span className="flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                <span>{label}</span>
            </span>
        </button>
    )
}
export default Button;
