'use client';

import { LENGTHS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';
import OptionGrid from './OptionGrid';

const LengthSelector = () => {
    const { length, setLength } = useCustomizer();
    return (
        <OptionGrid
            label="Length"
            options={LENGTHS}
            value={length}
            onChange={setLength}
            columns={3}
        />
    );
};

export default LengthSelector;
