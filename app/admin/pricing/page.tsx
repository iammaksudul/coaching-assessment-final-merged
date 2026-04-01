"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Save, Edit2, Plus, Eye, DollarSign } from "lucide-react"
import Link from "next/link"

interface Tier {
  id: string; name: string; assessments: string; monthly_price: number; annual_price: number
  stripe_product_id: string | null; stripe_monthly_price_id: string | null; stripe_annual_price_id: string | null
  features: string[]; is_free: boolean; is_popular: boolean; active: boolean; sort_order: number
}

export default function AdminPricingPage() {
  const { toast } = useToast()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [editing, setEditing] = useState<Tier | null>(null)
  const [featuresText, setFeaturesText] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchTiers = async () => {
    const res = await fetch("/api/admin/pricing")
    if (res.ok) { const d = await res.json(); setTiers(d.tiers || []) }
    setLoading(false)
  }
  useEffect(() => { fetchTiers() }, [])

  const startEdit = (tier: Tier) => {
    setEditing({ ...tier })
    setFeaturesText((tier.features || []).join("\n"))
  }

  const saveTier = async () => {
    if (!editing) return
    const updated = { ...editing, features: featuresText.split("\n").map(f => f.trim()).filter(Boolean) }
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: updated }),
    })
    if (res.ok) {
      toast({ title: "Saved", description: `${updated.name} updated` })
      setEditing(null)
      fetchTiers()
    } else {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" })
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Pricing</h1>
          <p className="text-muted-foreground">Edit pricing tiers, features, and Stripe IDs. Changes are live immediately.</p>
        </div>
        <Link href="/pricing" target="_blank">
          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View Pricing Page</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {tiers.map(tier => (
          <Card key={tier.id} className={!tier.active ? "opacity-50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  {tier.is_free && <Badge variant="secondary">Free</Badge>}
                  {tier.is_popular && <Badge>Popular</Badge>}
                  {!tier.active && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-muted-foreground">
                    {tier.is_free ? "Free" : `$${(tier.monthly_price / 100).toFixed(0)}/mo · $${(tier.annual_price / 100).toFixed(0)}/yr`}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit(tier)}>
                    <Edit2 className="h-4 w-4 mr-1" />Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground">{tier.assessments}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(tier.features || []).map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}
              </div>
              {tier.stripe_product_id && (
                <div className="text-xs text-muted-foreground mt-2">
                  Stripe: {tier.stripe_product_id} · Monthly: {tier.stripe_monthly_price_id || "—"} · Annual: {tier.stripe_annual_price_id || "—"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit {editing.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Tier ID</Label><Input value={editing.id} disabled className="bg-muted" /></div>
              </div>
              <div><Label>Assessments Description</Label><Input value={editing.assessments} onChange={e => setEditing({ ...editing, assessments: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Monthly Price (cents)</Label><Input type="number" value={editing.monthly_price} onChange={e => setEditing({ ...editing, monthly_price: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Annual Price (cents)</Label><Input type="number" value={editing.annual_price} onChange={e => setEditing({ ...editing, annual_price: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="text-xs text-muted-foreground">
                Monthly: ${(editing.monthly_price / 100).toFixed(2)} · Annual: ${(editing.annual_price / 100).toFixed(2)}
              </div>
              <div><Label>Stripe Product ID</Label><Input value={editing.stripe_product_id || ""} onChange={e => setEditing({ ...editing, stripe_product_id: e.target.value })} placeholder="prod_..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Monthly Price ID</Label><Input value={editing.stripe_monthly_price_id || ""} onChange={e => setEditing({ ...editing, stripe_monthly_price_id: e.target.value })} placeholder="price_..." /></div>
                <div><Label>Annual Price ID</Label><Input value={editing.stripe_annual_price_id || ""} onChange={e => setEditing({ ...editing, stripe_annual_price_id: e.target.value })} placeholder="price_..." /></div>
              </div>
              <div><Label>Features (one per line)</Label><Textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} rows={5} /></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={editing.is_popular} onCheckedChange={v => setEditing({ ...editing, is_popular: v })} /><Label>Popular</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.is_free} onCheckedChange={v => setEditing({ ...editing, is_free: v })} /><Label>Free Tier</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={v => setEditing({ ...editing, active: v })} /><Label>Active</Label></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveTier}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
