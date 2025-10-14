import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Moon, Sun, Check, LogOut } from 'lucide-react';

function SettingsPage() {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const navigate = useNavigate();

  const themeOptions = [
    { id: 'dark', name: 'Dark Mode', icon: Moon, preview: 'bg-slate-900' },
    { id: 'light', name: 'Light Mode', icon: Sun, preview: 'bg-gray-50' },
    { id: 'blue', name: 'Ocean Blue', icon: Palette, preview: 'bg-blue-950' },
    { id: 'purple', name: 'Purple Dream', icon: Palette, preview: 'bg-purple-950' },
    { id: 'green', name: 'Forest Green', icon: Palette, preview: 'bg-green-950' },
    { id: 'rose', name: 'Rose Garden', icon: Palette, preview: 'bg-rose-950' }
  ];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cài đặt</h1>
          <p className={theme.textMuted}>Tùy chỉnh giao diện và trải nghiệm của bạn</p>
        </div>

        {/* Theme Section */}
        <div className={`${theme.bgSecondary} rounded-2xl p-6 ${theme.border} border`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 ${theme.bgTertiary} rounded-xl`}>
              <Palette size={24} className={theme.accentText} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Giao diện</h2>
              <p className={`text-sm ${theme.textMuted}`}>Chọn chủ đề màu sắc yêu thích của bạn</p>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentTheme === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => changeTheme(option.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300
                    ${isActive 
                      ? `${theme.border} ${theme.bgTertiary} shadow-lg scale-105` 
                      : `${theme.border} ${theme.bgSecondary} hover:${theme.bgTertiary} hover:scale-102`
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className={`absolute top-3 right-3 ${theme.accent} rounded-full p-1`}>
                      <Check size={16} className="text-white" />
                    </div>
                  )}

                  {/* Theme Preview */}
                  <div className={`${option.preview} h-24 rounded-lg mb-4 flex items-center justify-center`}>
                    <Icon size={32} className="text-white opacity-80" />
                  </div>

                  {/* Theme Name */}
                  <h3 className={`font-semibold ${theme.text}`}>{option.name}</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1`}>
                    {themes[option.id].name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Current Theme Info */}
          <div className={`mt-6 p-4 ${theme.bgTertiary} rounded-lg`}>
            <p className={`text-sm ${theme.textMuted}`}>
              Chủ đề hiện tại: <span className={`font-semibold ${theme.text}`}>{themes[currentTheme].name}</span>
            </p>
          </div>
        </div>

        {/* Additional Settings */}
        <div className={`${theme.bgSecondary} rounded-2xl p-6 ${theme.border} border mt-6`}>
          <h2 className="text-xl font-bold mb-4">Cài đặt khác</h2>
          
          {/* Exit Syncho Button */}
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center justify-between p-4 ${theme.bgTertiary} hover:bg-red-500/10 rounded-xl transition-all duration-300 group border-2 border-transparent hover:border-red-500/50`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                <LogOut size={20} className="text-red-400" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${theme.text} group-hover:text-red-400 transition-colors`}>
                  Thoát Syncho
                </h3>
                <p className={`text-sm ${theme.textMuted}`}>
                  Quay về trang chủ
                </p>
              </div>
            </div>
            <div className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
