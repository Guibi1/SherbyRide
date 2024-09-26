"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, CarIcon, ClockIcon, DollarSignIcon, FilterIcon, UserIcon } from "lucide-react";

export default function RidesPage() {
    return (
        <main className="flex-1">
            <section className="w-full py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6">
                    <h1 className="text-3xl font-bold tracking-tighter mb-4">Find a Ride to San Francisco</h1>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-4 md:col-span-1">
                            <div>
                                <label className="text-sm font-medium" htmlFor="departure">
                                    Departure
                                </label>
                                <Input id="departure" placeholder="Enter departure location" />
                            </div>
                            <div>
                                <label className="text-sm font-medium" htmlFor="date">
                                    Date
                                </label>
                                <Input id="date" type="date" />
                            </div>
                            <div>
                                <label className="text-sm font-medium" htmlFor="passengers">
                                    Passengers
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
                            <div>
                                <Label className="text-sm font-medium">Price Range</Label>
                                <Slider defaultValue={[0, 100]} max={100} step={1} />
                            </div>
                            <Button className="w-full">
                                <FilterIcon className="w-4 h-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>

                        <div className="md:col-span-3">
                            <div className="grid gap-6">
                                {[1, 2, 3, 4, 5].map((ride) => (
                                    <Card key={ride}>
                                        <CardHeader>
                                            <CardTitle>Ride to San Francisco</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <CarIcon className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">From: Los Angeles</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Date: June 15, 2023</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Departure Time: 9:00 AM</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <UserIcon className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">3 seats available</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSignIcon className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Price: $25 per seat</span>
                                                </div>
                                            </div>
                                            <Button className="w-full mt-4">Book Now</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
