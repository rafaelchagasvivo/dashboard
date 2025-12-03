import { Sun, Moon, Zap } from 'lucide-react';
import { useTheme, type Theme } from '../hooks/useTheme';
import clsx from 'clsx';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const themes: { id: Theme; icon: any; label: string }[] = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'vivo', icon: Zap, label: 'Vivo' },
    ];

    return (
        <div className="flex bg-card-bg border border-border-color rounded-full p-1">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={clsx(
                        "p-2 rounded-full transition-all duration-200",
                        theme === t.id
                            ? "bg-vivo-purple text-white shadow-md"
                            : "text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                    title={t.label}
                >
                    <t.icon size={18} />
                </button>
            ))}
        </div>
    );
}
