'use client';

import { SLEEVES } from './data/options';
import { useCustomizer } from './context/CustomizerContext';
import OptionGrid from './OptionGrid';

const SleeveSelector = () => {
    const { sleeve, setSleeve } = useCustomizer();
    return (
        <OptionGrid
            label="Sleeve"
            options={SLEEVES}
            value={sleeve}
            onChange={setSleeve}
            columns={3}
        />
    );
};

export default SleeveSelector;
