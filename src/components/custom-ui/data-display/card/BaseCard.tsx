import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BaseCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
  description?: string
  icon?: React.ElementType
  footer?: React.ReactNode
  action?: React.ReactNode
  onClick?: () => void
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, title, description, icon: Icon, footer, action, onClick, ...props }, ref) => {
    return (
      <Card 
        ref={ref} 
        className={cn("flex flex-col overflow-hidden transition-all", onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md", className)} 
        onClick={onClick}
        {...props}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="space-y-1">
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
          </div>
          {action && <div className="ml-auto">{action}</div>}
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
          {props.children}
        </CardContent>
        {footer && (
          <CardFooter className="bg-muted/50 p-4 text-sm">
            {footer}
          </CardFooter>
        )}
      </Card>
    )
  }
)

BaseCard.displayName = "BaseCard"
