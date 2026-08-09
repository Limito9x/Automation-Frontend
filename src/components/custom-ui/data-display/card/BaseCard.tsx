import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

export interface BaseCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
  description?: string
  icon?: React.ElementType
  thumbnailUrl?: string
  fallbackThumbnail?: React.ReactNode
  footer?: React.ReactNode
  action?: React.ReactNode
  onClick?: () => void
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, title, description, icon: Icon, thumbnailUrl, fallbackThumbnail, footer, action, onClick, children, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);

    return (
      <Card 
        ref={ref} 
        className={cn("flex flex-col overflow-hidden transition-all hover:border-primary/40 hover:shadow-sm", onClick && "cursor-pointer", className)} 
        onClick={onClick}
        {...props}
      >
        {(thumbnailUrl || fallbackThumbnail) && (
          <div className="relative w-full aspect-video bg-muted/40 overflow-hidden border-b flex items-center justify-center">
            {thumbnailUrl && !imgError ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              fallbackThumbnail || (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                </div>
              )
            )}
          </div>
        )}
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
            {Icon && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-base truncate">{title}</CardTitle>
            </div>
          </div>
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="bg-muted/30 p-3 text-xs text-muted-foreground border-t mt-auto">
            {footer}
          </CardFooter>
        )}
      </Card>
    )
  }
)

BaseCard.displayName = "BaseCard"
