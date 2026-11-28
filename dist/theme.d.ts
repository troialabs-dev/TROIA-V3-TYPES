export type BaseThemeId = 'apple' | 'current' | 'porcelana';
export type IconPackId = 'hi2' | 'lu' | 'fi' | 'tb';
export type RadiusScale = 'conservative' | 'moderate' | 'rounded';
export interface PageBackgroundOverride {
    type?: 'solid' | 'gradient' | 'image' | 'image-overlay';
    value?: string;
    overlay?: string;
    blur?: number;
    attachment?: 'fixed' | 'scroll';
}
export interface TenantThemeOverrides {
    brand?: {
        logo?: string;
        favicon?: string;
        displayName?: string;
    };
    colors?: {
        primary?: string;
        primaryHover?: string;
        success?: string;
        warning?: string;
        error?: string;
    };
    typography?: {
        fontFamily?: string;
        fontFamilyMono?: string;
    };
    background?: {
        page?: PageBackgroundOverride;
    };
    icons?: {
        pack?: IconPackId;
        strokeWidth?: number;
    };
    radius?: {
        scale?: RadiusScale;
    };
    borders?: {
        width?: '0.5px' | '1px';
    };
    darkMode?: {
        enabled?: boolean;
        colors?: TenantThemeOverrides['colors'];
        background?: TenantThemeOverrides['background'];
    };
}
