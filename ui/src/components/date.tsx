import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "../components/ui/button"
import { Calendar } from "../components/ui/calendar"
import { Input } from "../components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}


function formatDateToToday(iso: string): Date{
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day, 12)
}

function formatISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function Calendar28({
    selectedDate, 
    onChange,
}: {
    selectedDate: string
    onChange: (value:string) => void
}) {

    console.log("SelectedDate: ", selectedDate)
    const [open, setOpen] = React.useState(false)

    const startDate = formatDateToToday(selectedDate)

    const [date, setDate] = React.useState<Date | undefined>(startDate)
    const [month, setMonth] = React.useState<Date | undefined>(startDate)

    const value = formatDate(date)

    React.useEffect(() => {
      const updateDate = formatDateToToday(selectedDate)
      setDate(updateDate)
      setMonth(updateDate)
    }, [selectedDate])

    return (
        <div className="flex flex-col gap-3">
        <div className="relative flex gap-2">
            <Input
            id="date"
            value={value}
            readOnly
            placeholder="June 01, 2025"
            className="bg-white/60 pr-10"
            onKeyDown={(e) => {
              if (e.key == "ArrowDown"){
                e.preventDefault()
                setOpen(true)
              }
            }}
            />
            <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                id="date-picker"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select date</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
            >
                <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                month={month}
                onMonthChange={setMonth}
                startMonth={new Date(2020, 0)}
                endMonth={new Date(2026, 11)}
                onSelect={(newDate) => {
                  if (!newDate) return 
                  setDate(newDate)
                  const iso = formatISO(newDate)
                  onChange(iso)
                  setOpen(false)
                }}
                />
            </PopoverContent>
            </Popover>
        </div>
      </div>
    )
  }
