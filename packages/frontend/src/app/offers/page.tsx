import { auth } from "@/lib/auth";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function OffersPage() {
  const session = await auth()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-center">
        Hi <span className="italic">{session?.user?.name}</span>. Vous désirex publié une offre de déplacement?
          </CardTitle>
          <CardDescription className="text-center">
          Remplissez les informations ci-dessous pour offrir un déplacement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium" htmlFor="departure">
                Départ
              </label>
              <Input id="departure" placeholder="Veuillez entrer une location de départ" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium" htmlFor="destination">
                Destination
              </label>
              <Input id="destination" placeholder="Veuillez entrer une location d'arrivée" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium" htmlFor="date">
                Date du départ
              </label>
              <Input id="date" type="date" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium" htmlFor="time">
                Heure du départ
              </label>
              <Input id="time" type="time" />
            </div>
            <div className="flex flex-col space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="passengers">
                Combien de passagers?
              </label>
              <Select>
                <SelectTrigger id="passengers">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Publier l'offre</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
