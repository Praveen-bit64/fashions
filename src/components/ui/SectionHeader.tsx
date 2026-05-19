interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    titleFont?: 'delius-swash-caps' | 'courgette' | 'montez' | 'open-sans' | 'inter' | 'roboto';
    subtitleFont?: 'delius-swash-caps' | 'courgette' | 'montez' | 'open-sans' | 'inter' | 'roboto' | 'font-mono';
    titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    subtitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    textAlign?: 'left' | 'center' | 'right';
    showDivider?: boolean;
    dividerColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    spacing?: 'tight' | 'normal' | 'loose';
    className?: string;
}

const SectionHeader = ({
    title,
    subtitle,
    titleFont = 'delius-swash-caps',
    subtitleFont = 'font-mono',
    titleSize = '4xl',
    subtitleSize = 'xl',
    textAlign = 'center',
    showDivider = false,
    dividerColor = 'gray-300',
    titleColor = 'gray-900',
    subtitleColor = 'gray-600',
    maxWidth = '2xl',
    spacing = 'normal',
    className = ''
}: SectionHeaderProps) => {

    // Font classes mapping
    const fontClasses = {
        'delius-swash-caps': 'font-delius-swash-caps',
        'courgette': 'font-courgette',
        'montez': 'font-montez',
        'open-sans': 'font-open-sans',
        'inter': 'font-inter',
        'roboto': 'font-roboto',
        'font-mono': 'font-mono'
    };

    // Size classes mapping
    const titleSizeClasses = {
        'sm': 'text-sm',
        'md': 'text-md',
        'lg': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl'
    };

    const subtitleSizeClasses = {
        'xs': 'text-xs',
        'sm': 'text-sm',
        'md': 'text-md',
        'lg': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl'
    };

    // Text alignment classes
    const alignClasses = {
        'left': 'text-left',
        'center': 'text-center',
        'right': 'text-right'
    };

    // Max width classes
    const maxWidthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl'
    };

    // Spacing classes
    const spacingClasses = {
        'tight': 'mb-8',
        'normal': 'mb-12',
        'loose': 'mb-16'
    };

    return (
        <div className={`${alignClasses[textAlign]} ${spacingClasses[spacing]} ${className}`}>
            {/* Title */}
            <h2 className={`${fontClasses[titleFont]} font-bold ${titleSizeClasses[titleSize]} text-${titleColor} mb-4`}>
                {title}
            </h2>

            {/* Divider */}
            {showDivider && (
                <div className={`w-20 h-0.5 bg-${dividerColor} mx-auto mb-6`}></div>
            )}

            {/* Subtitle */}
            {subtitle && (
                <p className={`${fontClasses[subtitleFont]} ${subtitleSizeClasses[subtitleSize]} text-${subtitleColor} ${maxWidthClasses[maxWidth]} mx-auto`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default SectionHeader;