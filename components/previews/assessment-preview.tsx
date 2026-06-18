import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function AssessmentPreview() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Self-Assessment</h1>
        <p className="text-muted-foreground">Complete the assessment by answering questions about your coachability.</p>
        <div className="mt-4">
          <Progress value={25} className="h-2 w-full" />
          <p className="mt-2 text-sm text-muted-foreground">Domain 1 of 4: Openness to Feedback</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Openness to Feedback</CardTitle>
          <CardDescription>Please rate how often each statement applies to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label>I ask for feedback to help me improve.</Label>
              </div>
              <RadioGroup defaultValue="3" className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="q1-1" />
                  <Label htmlFor="q1-1" className="font-normal">
                    Never
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="q1-2" />
                  <Label htmlFor="q1-2" className="font-normal">
                    Rarely
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="q1-3" />
                  <Label htmlFor="q1-3" className="font-normal">
                    Sometimes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="q1-4" />
                  <Label htmlFor="q1-4" className="font-normal">
                    Often
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="q1-5" />
                  <Label htmlFor="q1-5" className="font-normal">
                    Always
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div>
                <Label>I stay calm and listen carefully when receiving feedback.</Label>
              </div>
              <RadioGroup defaultValue="4" className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="q2-1" />
                  <Label htmlFor="q2-1" className="font-normal">
                    Never
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="q2-2" />
                  <Label htmlFor="q2-2" className="font-normal">
                    Rarely
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="q2-3" />
                  <Label htmlFor="q2-3" className="font-normal">
                    Sometimes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="q2-4" />
                  <Label htmlFor="q2-4" className="font-normal">
                    Often
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="q2-5" />
                  <Label htmlFor="q2-5" className="font-normal">
                    Always
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div>
                <Label>I take action based on feedback I receive.</Label>
              </div>
              <RadioGroup defaultValue="3" className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="q3-1" />
                  <Label htmlFor="q3-1" className="font-normal">
                    Never
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="q3-2" />
                  <Label htmlFor="q3-2" className="font-normal">
                    Rarely
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="q3-3" />
                  <Label htmlFor="q3-3" className="font-normal">
                    Sometimes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="q3-4" />
                  <Label htmlFor="q3-4" className="font-normal">
                    Often
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="q3-5" />
                  <Label htmlFor="q3-5" className="font-normal">
                    Always
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button>Next</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
