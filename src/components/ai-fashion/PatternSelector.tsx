'use client';

import { PATTERNS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';
import OptionGrid from './OptionGrid';

const PatternSelector = () => {
    const { pattern, setPattern } = useCustomizer();
    return (
        <OptionGrid
            label="Pattern"
            options={PATTERNS}
            value={pattern}
            onChange={setPattern}
            columns={3}
        />
    );
};

export default PatternSelector;
