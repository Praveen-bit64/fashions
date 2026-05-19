'use client';

import MaterialSelector from './MaterialSelector';
import ColorSelector from './ColorSelector';
import SleeveSelector from './SleeveSelector';
import NeckSelector from './NeckSelector';
import LengthSelector from './LengthSelector';
import PatternSelector from './PatternSelector';
import SizeSelector from './SizeSelector';

const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
);

const CustomizationPanel = () => {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                    Make It Yours
                </p>
                <h3 className="font-delius-swash-caps text-2xl text-gray-900 leading-tight">
                    Customize Every Detail
                </h3>
            </div>

            <MaterialSelector />
            <Divider />
            <ColorSelector />
            <Divider />
            <SleeveSelector />
            <Divider />
            <NeckSelector />
            <Divider />
            <LengthSelector />
            <Divider />
            <PatternSelector />
            <Divider />
            <SizeSelector />
        </div>
    );
};

export default CustomizationPanel;
