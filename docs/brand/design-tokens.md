# LevelUp — Design System Tokens

## Color System

### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#6C5CE7` | Primary actions, links, active states |
| `--color-primary-hover` | `#7C6EF0` | Hover state |
| `--color-primary-muted` | `#6C5CE720` | Backgrounds, subtle highlights |
| `--color-primary-strong` | `#5A4BD6` | Pressed state, emphasis |

### Accent / XP Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-xp` | `#FDCB6E` | XP earned, level indicators, gold |
| `--color-xp-glow` | `#FDCB6E40` | XP gain animation glow |
| `--color-streak` | `#FF6B6B` | Streak fire, urgent warnings |
| `--color-streak-muted` | `#FF6B6B20` | Streak backgrounds |
| `--color-success` | `#00B894` | Verified, completed, positive |
| `--color-success-muted` | `#00B89420` | Success backgrounds |

### Neutral / Surface Colors (Dark Mode — Primary)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0F0F14` | Page background |
| `--color-bg-elevated` | `#16161E` | Card backgrounds |
| `--color-bg-hover` | `#1E1E2A` | Hover states on cards |
| `--color-border` | `#2A2A3A` | Subtle borders |
| `--color-border-strong` | `#3A3A4E` | Emphasized borders |
| `--color-text` | `#F0F0F5` | Primary text |
| `--color-text-secondary` | `#A0A0B8` | Secondary text, labels |
| `--color-text-dim` | `#6A6A80` | Placeholder, disabled |

### Light Mode Surface Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-light` | `#FAFAFE` | Page background |
| `--color-bg-elevated-light` | `#FFFFFF` | Card backgrounds |
| `--color-bg-hover-light` | `#F0F0F8` | Hover states |
| `--color-border-light` | `#E4E4ED` | Borders |
| `--color-text-light` | `#1A1A2E` | Primary text |
| `--color-text-secondary-light` | `#6A6A80` | Secondary text |

## Typography

### Font Stack
| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Space Grotesk | 700 | Hero text, level numbers, big stats |
| Body | Inter | 400, 500, 600 | All body text, UI elements |
| Mono | JetBrains Mono | 400 | Code snippets, XP numbers, data |

### Type Scale (rem, base 16px)
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1rem | Badges, captions |
| `--text-sm` | 0.875rem (14px) | 1.25rem | Secondary text, labels |
| `--text-base` | 1rem (16px) | 1.5rem | Body text |
| `--text-lg` | 1.125rem (18px) | 1.75rem | Card titles |
| `--text-xl` | 1.25rem (20px) | 1.75rem | Section headers |
| `--text-2xl` | 1.5rem (24px) | 2rem | Page titles |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | Dashboard stats |
| `--text-4xl` | 2.25rem (36px) | 2.5rem | Hero text |
| `--text-5xl` | 3rem (48px) | 1 | Level display |

## Spacing (4px grid)
| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small elements |
| `--radius-md` | 10px | Buttons, inputs |
| `--radius-lg` | 14px | Cards |
| `--radius-xl` | 20px | Modals, large cards |
| `--radius-full` | 9999px | Pills, circular |

## Shadows
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` |
| `--shadow-glow-primary` | `0 0 20px var(--color-primary-muted)` |
| `--shadow-glow-xp` | `0 0 20px var(--color-xp-glow)` |

## Motion

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Button hover, toggle |
| `--duration-normal` | 250ms | Card transitions, fade-ins |
| `--duration-slow` | 400ms | Page transitions, modals |
| `--duration-celebrate` | 800ms | XP gain, level up, achievement unlock |

### Easing
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Elements entering view |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | Elements transitioning |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy feel, celebrations |

### Key Animations
- **XP Gain:** Number counts up + gold particle burst + glow pulse
- **Level Up:** Full-screen overlay with level number scaling up + confetti
- **Task Complete:** Checkmark draws itself + card slides to "done" pile + XP bar fills
- **Streak Fire:** Flame icon pulses + streak number scales with spring
- **Achievement Unlock:** Badge slides in from right + shimmer effect

## Iconography
- **Set:** Phosphor Icons (https://phosphoricons.com/) — consistent, has all needed glyphs, light/regular/bold weights
- **Size grid:** 16px, 20px, 24px, 32px
- **Style:** Regular weight for body, Bold for emphasis/actions
- **Color:** Inherit from text color, use brand colors for emphasis

## Component Patterns

### Cards
- Background: `--color-bg-elevated`
- Border: 1px `--color-border`
- Radius: `--radius-lg`
- Padding: `--space-5` (20px)
- Hover: background shifts to `--color-bg-hover`, border to `--color-border-strong`

### Buttons
- Primary: `--color-primary` bg, white text, `--radius-md`
- Secondary: transparent bg, `--color-primary` text, 1px `--color-primary` border
- Ghost: transparent bg, `--color-text-secondary` text
- All: `--duration-fast` transition, `--ease-out` easing
- Hover: lighten bg 10%, scale 1.02
- Active: darken bg 5%, scale 0.98

### Inputs
- Background: `--color-bg`
- Border: 1px `--color-border`
- Focus: 2px `--color-primary` ring with 2px offset
- Error: border `--color-streak`, helper text in same color
- Radius: `--radius-md`
- Height: 44px (accessibility minimum)

### Badges/Tags
- Background: category color at 15% opacity
- Text: category color
- Radius: `--radius-full` (pill)
- Padding: `--space-1` `--space-3`
