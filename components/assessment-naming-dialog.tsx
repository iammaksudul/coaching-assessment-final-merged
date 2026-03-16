"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Edit3, Save } from "lucide-react"

interface AssessmentNamingDialogProps {
  assessmentId: string
  currentName: string
  currentDescription?: string
  onUpdate: (name: string, description?: string) => void
  trigger?: React.ReactNode
}

export function AssessmentNamingDialog({
  assessmentId,
  currentName,
  currentDescription,
  onUpdate,
  trigger,
}: AssessmentNamingDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your assessment.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Mock API call - in real app this would call the API
      await new Promise((resolve) => setTimeout(resolve, 500))

      onUpdate(name.trim(), description.trim() || undefined)

      toast({
        title: "Assessment Updated",
        description: "Your assessment name and description have been saved.",
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setName(currentName)
    setDescription(currentDescription || "")
    setIsOpen(false)
  }

  const generateSuggestions = () => {
    const now = new Date()
    const month = now.toLocaleDateString("en-US", { month: "long" })
    const year = now.getFullYear()
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`

    return [
      `Coachability Assessment - ${month} ${year}`,
      `${quarter} ${year} Leadership Development Assessment`,
      `Personal Development Assessment - ${year}`,
      `360 Feedback Assessment - ${month} ${year}`,
      `Executive Coaching Assessment - ${quarter} ${year}`,
    ]
  }

  const suggestions = generateSuggestions()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit3 className="w-3 h-3 mr-1" />
            Edit Name
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Name Your Assessment</DialogTitle>
          <DialogDescription>
            Give your assessment a meaningful name and description to help you identify it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="assessment-name">Assessment Name *</Label>
            <Input
              id="assessment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a descriptive name for your assessment"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground mt-1">{name.length}/100 characters</div>
          </div>

          <div>
            <Label htmlFor="assessment-description">Description (Optional)</Label>
            <Textarea
              id="assessment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description to provide context about this assessment's purpose..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">{description.length}/500 characters</div>
          </div>

          {/* Name Suggestions */}
          <div>
            <Label className="text-sm font-medium">Suggested Names</Label>
            <div className="space-y-1 mt-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className="block w-full text-left text-sm p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !name.trim()}>
            {isUpdating ? (
              <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
