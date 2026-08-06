import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function NotificationsSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 md:hidden mb-4">
          <Button variant="ghost" size="icon" className="-ml-2">
            <Link to="/settings">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h3 className="text-lg font-medium">Settings</h3>
        </div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>
      <Separator />

      {/* Form */}
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products, features, and more.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Security emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your account security.
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <Button type="button">Update notifications</Button>
      </div>
    </div>
  )
}
