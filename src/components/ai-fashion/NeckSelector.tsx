'use client';

import { NECKS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';
import OptionGrid from './OptionGrid';

const NeckSelector = () => {
    const { neck, setNeck } = useCustomizer();
    return (
        <OptionGrid
            label="Neckline"
            options={NECKS}
            value={neck}
            onChange={setNeck}
            columns={3}
        />
    );
};

export default NeckSelector;
