import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Volume2, VolumeX, Eye, Type, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import { DifficultySettings, DifficultyTuner } from "@/lib/difficulty-tuner";
import { audioManager } from "@/lib/audio";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<DifficultySettings>(DifficultyTuner.getInitialSettings());
  const [audioMuted, setAudioMuted] = useState(audioManager.isMutedState());
  const [showSubtitles, setShowSubtitles] = useState(
    localStorage.getItem('show_subtitles') === 'true'
  );

  useEffect(() => {
    if (isOpen) {
      const current = DifficultyTuner.getInitialSettings();
      setSettings(current);
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof DifficultySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    DifficultyTuner.saveSettings(newSettings);
  };

  const handleAudioToggle = (muted: boolean) => {
    setAudioMuted(muted);
    audioManager.setMuted(muted);
    localStorage.setItem('audio_muted', muted.toString());
  };

  const handleSubtitlesToggle = (show: boolean) => {
    setShowSubtitles(show);
    localStorage.setItem('show_subtitles', show.toString());
  };

  const exportProgress = async () => {
    try {
      const progressData = {
        date: new Date().toISOString(),
        settings,
        stats: localStorage.getItem('user_stats'),
        spacedItems: localStorage.getItem('spaced_items'),
        achievements: localStorage.getItem('achievements')
      };

      const blob = new Blob([JSON.stringify(progressData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spanish-learning-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to export progress:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-fredoka text-3xl text-friendly-dark flex items-center">
            <Settings className="mr-3 text-coral" />
            Instellingen
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl text-friendly-dark flex items-center">
                <Volume2 className="mr-2 text-mint" />
                Geluid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Geluid aan/uit</span>
                <Switch
                  checked={!audioMuted}
                  onCheckedChange={(checked) => handleAudioToggle(!checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Ondertitels tonen</span>
                <Switch
                  checked={showSubtitles}
                  onCheckedChange={handleSubtitlesToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl text-friendly-dark flex items-center">
                <Eye className="mr-2 text-sunny" />
                Toegankelijkheid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Dyslexie-vriendelijk</span>
                <Switch
                  checked={settings.dyslexiaFriendly}
                  onCheckedChange={(checked) => 
                    handleSettingChange('dyslexiaFriendly', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Lettergrootte</span>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: 'normal' | 'large' | 'extra-large') =>
                    handleSettingChange('fontSize', value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normaal</SelectItem>
                    <SelectItem value="large">Groot</SelectItem>
                    <SelectItem value="extra-large">Extra groot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Extra tijd</span>
                <Switch
                  checked={settings.extraTime}
                  onCheckedChange={(checked) => 
                    handleSettingChange('extraTime', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl text-friendly-dark flex items-center">
                <Type className="mr-2 text-success" />
                Leren
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Hints tonen</span>
                <Switch
                  checked={settings.showHints}
                  onCheckedChange={(checked) => 
                    handleSettingChange('showHints', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Nederlands na 2 fouten</span>
                <Switch
                  checked={settings.showDutchOnSecondMistake}
                  onCheckedChange={(checked) => 
                    handleSettingChange('showDutchOnSecondMistake', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-nunito text-friendly-dark">Max antwoordopties</span>
                <Select
                  value={settings.maxOptions.toString()}
                  onValueChange={(value) =>
                    handleSettingChange('maxOptions', parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl text-friendly-dark flex items-center">
                <Download className="mr-2 text-coral" />
                Voortgang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportProgress}
                className="w-full bg-coral hover:bg-coral/90 text-white font-nunito"
              >
                <Download className="mr-2 w-4 h-4" />
                Voortgang exporteren voor ouders
              </Button>
              <p className="text-xs text-gray-500 mt-2 font-nunito">
                Download je leervoortgang als JSON-bestand
              </p>
            </CardContent>
          </Card>

          {/* Classroom Mode Info */}
          {audioManager.isClassroomMode() && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏫</span>
                  <div>
                    <h3 className="font-fredoka text-lg text-amber-800">Klaslokaal Modus</h3>
                    <p className="font-nunito text-sm text-amber-700">
                      Geluidsniveaus zijn verlaagd en het tempo is aangepast voor gebruik in de klas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={onClose}
            className="bg-mint hover:bg-mint/90 text-white font-nunito px-8 py-2 rounded-2xl"
          >
            Sluiten
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}