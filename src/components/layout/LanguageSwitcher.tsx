"use client"

import * as React from "react"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  // Placeholder for language switching logic
  const [currentLanguage, setCurrentLanguage] = React.useState("English")

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    // Implement actual language change logic here (e.g., using i18n library)
    alert(`Language changed to ${lang}. (This is a placeholder)`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language, current: {currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("English")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("Swahili")}>
          Swahili
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("French")}>
          French
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
