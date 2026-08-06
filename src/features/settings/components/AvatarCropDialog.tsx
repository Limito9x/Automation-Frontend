import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { BaseDialog } from '@/components/custom-ui/dialog/BaseDialog'
import { getCroppedImg } from '../utils/cropImage'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface AvatarCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (file: File) => void
  isProcessing?: boolean
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  isProcessing = false
}: AvatarCropDialogProps) {
  const { t } = useTranslation("settings")
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropCompleteHandler = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 'avatar.jpg')
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("profile.avatar.cropTitle", { defaultValue: "Crop Avatar" })}
      size="md"
    >
      <div className="flex flex-col space-y-6 pt-4">
        {/* Cropper Container */}
        <div className="relative h-64 w-full sm:h-80 bg-black/10 rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        
        {/* Zoom Control */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t("profile.avatar.zoom", { defaultValue: "Zoom" })}
          </label>
          <Slider
            value={zoom}
            minValue={1}
            maxValue={3}
            step={0.1}
            onChange={(val) => setZoom(val as number)}
            aria-label="Zoom"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onPress={() => onOpenChange(false)} isDisabled={isProcessing}>
            {t("actions.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onPress={handleSave} isPending={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profile.avatar.processing", { defaultValue: "Processing..." })}
              </>
            ) : (
              t("actions.save", { defaultValue: "Crop & Save" })
            )}
          </Button>
        </div>
      </div>
    </BaseDialog>
  )
}
