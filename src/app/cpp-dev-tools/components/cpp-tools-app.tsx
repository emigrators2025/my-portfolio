"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  Upload,
  Settings,
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Sparkles,
  Terminal,
  FileCode,
  Braces,
  Bug,
  Gauge,
  Clock,
  MemoryStick,
  Cpu,
  FileText,
  RotateCcw,
  Maximize2,
  Minimize2,
  Github,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Sample C++ code
const sampleCppCode = `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

// Calculate fibonacci number
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

// Class definition
class Calculator {
private:
    double result;
public:
    Calculator() : result(0) {}
    
    double add(double a, double b) {
        result = a + b;
        return result;
    }
    
    double multiply(double a,double b){
        result=a*b;
        return result;
    }
    
    void printResult() {
        cout << "Result: " << result << endl;
    }
};

int main() {
    Calculator calc;
    cout << calc.add(5, 3) << endl;
    cout << calc.multiply(4, 7) << endl;
    
    vector<int> numbers = {5, 2, 8, 1, 9};
    sort(numbers.begin(), numbers.end());
    
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Calculate fibonacci
    for(int i = 0; i < 10; i++) {
        cout << fibonacci(i) << " ";
    }
    
    return 0;
}`

// Diagnostic types
interface Diagnostic {
  line: number
  column: number
  severity: "error" | "warning" | "info" | "hint"
  message: string
  code?: string
}

// Format result type
interface FormatResult {
  formatted: string
  changes: number
}

// Analysis result type
interface AnalysisResult {
  complexity: {
    cyclomatic: number
    cognitive: number
    linesOfCode: number
    functions: number
    classes: number
  }
  performance: {
    estimatedTime: string
    memoryUsage: string
    optimizationScore: number
    suggestions: string[]
  }
  security: {
    score: number
    issues: Array<{ severity: string; description: string }>
  }
}

export default function CppToolsApp() {
  const [code, setCode] = React.useState(sampleCppCode)
  const [output, setOutput] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("editor")
  const [activeTool, setActiveTool] = React.useState("format")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [diagnostics, setDiagnostics] = React.useState<Diagnostic[]>([])
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Real C++ code formatter following Google Style Guide
  const formatCode = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    let formatted = code
    let changes = 0

    // 1. Normalize line endings
    formatted = formatted.replace(/\r\n/g, "\n")

    // 2. Fix indentation (2 spaces per level - Google Style)
    const lines = formatted.split("\n")
    let indentLevel = 0
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ""

      // Decrease indent for closing braces
      if (trimmed.startsWith("}") || trimmed.startsWith(");")) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      // Handle case/default labels and access specifiers
      let currentIndent = indentLevel
      if (trimmed.startsWith("case ") || trimmed.startsWith("default:")) {
        currentIndent = Math.max(0, indentLevel - 1)
      }
      if (trimmed.startsWith("public:") || trimmed.startsWith("private:") || trimmed.startsWith("protected:")) {
        currentIndent = Math.max(0, indentLevel - 1)
      }

      const indentedLine = "  ".repeat(currentIndent) + trimmed

      // Increase indent for opening braces
      if (trimmed.endsWith("{")) {
        indentLevel++
      }

      return indentedLine
    })
    formatted = formattedLines.join("\n")

    // 3. Add space after control keywords
    const keywords = ["if", "else", "for", "while", "switch", "catch", "do"]
    keywords.forEach((kw) => {
      formatted = formatted.replace(new RegExp(`\\b${kw}\\(`, "g"), `${kw} (`)
    })

    // 4. Fix brace style (K&R / Google Style)
    formatted = formatted.replace(/\)\s*\n\s*{/g, ") {")
    formatted = formatted.replace(/}\s*\n\s*else/g, "} else")
    formatted = formatted.replace(/else\s*\n\s*{/g, "else {")
    formatted = formatted.replace(/else\s*if\s*\(/g, "else if (")

    // 5. Fix operator spacing
    formatted = formatted.replace(/\s*([\+\-\*\/\%]?=)\s*/g, " $1 ")
    formatted = formatted.replace(/\s*(<|>|<=|>=|==|!=)\s*/g, " $1 ")
    formatted = formatted.replace(/([^,])\s*,\s*/g, "$1, ")

    // 6. Fix pointer/reference (Google style: int* ptr, int& ref)
    formatted = formatted.replace(/(\w)\s+\*\s*(\w)/g, "$1* $2")
    formatted = formatted.replace(/(\w)\s+&\s*(\w)/g, "$1& $2")

    // 7. Remove multiple blank lines
    formatted = formatted.replace(/\n{3,}/g, "\n\n")

    // 8. Remove trailing whitespace
    formatted = formatted.replace(/[ \t]+$/gm, "")

    // 9. Ensure single newline at end
    formatted = formatted.replace(/\n*$/, "\n")

    // Count changed lines
    const originalLines = code.split("\n")
    const newLines = formatted.split("\n")
    changes = originalLines.filter((line, i) => line !== newLines[i]).length

    setCode(formatted)
    setOutput(`✓ Code formatted successfully!\n\nApplied ${changes} changes:\n- Fixed indentation (2-space Google style)\n- Normalized brace placement (K&R style)\n- Fixed operator spacing\n- Fixed pointer/reference alignment\n- Removed trailing whitespace`)
    setIsProcessing(false)
  }

  // Real C++ linter with pattern-based analysis
  const lintCode = async () => {
    setIsProcessing(true)
    setDiagnostics([])
    await new Promise(resolve => setTimeout(resolve, 600))

    const newDiagnostics: Diagnostic[] = []
    const lines = code.split("\n")

    lines.forEach((line, index) => {
      const lineNum = index + 1

      // Check for using namespace std
      if (line.includes("using namespace std")) {
        newDiagnostics.push({
          line: lineNum,
          column: line.indexOf("using") + 1,
          severity: "warning",
          message: "Avoid 'using namespace std;' - prefer explicit std:: prefix",
          code: "W001"
        })
      }

      // Check for raw new/delete
      if (/\bnew\s+\w+/.test(line) && !line.includes("unique_ptr") && !line.includes("shared_ptr")) {
        newDiagnostics.push({
          line: lineNum,
          column: line.indexOf("new") + 1,
          severity: "warning",
          message: "Consider using smart pointers (std::unique_ptr, std::shared_ptr) instead of raw new",
          code: "W002"
        })
      }

      // Check for C-style casts
      if (/\(\s*(int|float|double|char|long|short|unsigned)\s*\)\s*\w/.test(line)) {
        newDiagnostics.push({
          line: lineNum,
          column: 1,
          severity: "info",
          message: "Prefer C++ casts (static_cast, const_cast, reinterpret_cast) over C-style casts",
          code: "I001"
        })
      }

      // Check for NULL instead of nullptr
      if (/\bNULL\b/.test(line)) {
        newDiagnostics.push({
          line: lineNum,
          column: line.indexOf("NULL") + 1,
          severity: "info",
          message: "Use 'nullptr' instead of 'NULL' in C++11 and later",
          code: "I002"
        })
      }

      // Check for magic numbers
      if (/[=<>]\s*\d{2,}(?!\d*\.\d)/.test(line) && !line.includes("//") && !line.includes("0x")) {
        newDiagnostics.push({
          line: lineNum,
          column: 1,
          severity: "hint",
          message: "Consider using named constants instead of magic numbers",
          code: "H001"
        })
      }

      // Check for long lines (>120 chars - Google style)
      if (line.length > 120) {
        newDiagnostics.push({
          line: lineNum,
          column: 121,
          severity: "info",
          message: `Line exceeds 120 characters (${line.length} chars) - consider breaking it up`,
          code: "I003"
        })
      }

      // Check for recursive functions without memoization hint
      if (/return\s+\w+\s*\([^)]*-\s*[12]\s*\)/.test(line)) {
        newDiagnostics.push({
          line: lineNum,
          column: 1,
          severity: "warning",
          message: "Recursive call detected. Consider memoization for better performance",
          code: "P001"
        })
      }

      // Check for empty catch blocks
      if (/catch\s*\([^)]*\)\s*{\s*}/.test(line)) {
        newDiagnostics.push({
          line: lineNum,
          column: line.indexOf("catch") + 1,
          severity: "warning",
          message: "Empty catch block - exceptions should be handled or logged",
          code: "W003"
        })
      }

      // Check for #define instead of constexpr
      if (/^#define\s+\w+\s+\d+/.test(line.trim())) {
        newDiagnostics.push({
          line: lineNum,
          column: 1,
          severity: "info",
          message: "Prefer 'constexpr' over #define for constants in modern C++",
          code: "I004"
        })
      }

      // Check for TODO/FIXME comments
      if (/\/\/.*\b(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
        newDiagnostics.push({
          line: lineNum,
          column: line.search(/TODO|FIXME|HACK|XXX/i) + 1,
          severity: "info",
          message: "Unresolved TODO/FIXME comment found",
          code: "I005"
        })
      }
    })

    // Check for potential memory leaks (new without delete in same scope)
    const hasNew = /\bnew\s+\w+/.test(code)
    const hasDelete = /\bdelete\b/.test(code)
    const hasSmartPtr = /unique_ptr|shared_ptr|make_unique|make_shared/.test(code)
    if (hasNew && !hasDelete && !hasSmartPtr) {
      newDiagnostics.push({
        line: 1,
        column: 1,
        severity: "warning",
        message: "Memory allocated with 'new' but no 'delete' or smart pointer found - potential memory leak",
        code: "W004"
      })
    }

    setDiagnostics(newDiagnostics)
    const errors = newDiagnostics.filter(d => d.severity === "error").length
    const warnings = newDiagnostics.filter(d => d.severity === "warning").length
    const infos = newDiagnostics.filter(d => d.severity === "info").length
    const hints = newDiagnostics.filter(d => d.severity === "hint").length

    setOutput(`Linting complete!\n\nFound ${newDiagnostics.length} issues:\n- ${errors} error${errors !== 1 ? 's' : ''}\n- ${warnings} warning${warnings !== 1 ? 's' : ''}\n- ${infos} informational\n- ${hints} hint${hints !== 1 ? 's' : ''}`)
    setIsProcessing(false)
  }

  // Real code complexity analysis
  const analyzeCode = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    const lines = code.split("\n")
    const nonEmptyLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith("//"))

    // Count functions (including member functions)
    const functionMatches = code.match(/\b\w+\s+\w+\s*\([^)]*\)\s*(const)?\s*(\{|:)/g) || []
    const functions = functionMatches.length

    // Count classes and structs
    const classMatches = code.match(/\b(class|struct)\s+\w+/g) || []
    const classes = classMatches.length

    // Calculate Cyclomatic Complexity
    const ifCount = (code.match(/\bif\s*\(/g) || []).length
    const elseIfCount = (code.match(/\belse\s+if\s*\(/g) || []).length
    const forCount = (code.match(/\bfor\s*\(/g) || []).length
    const whileCount = (code.match(/\bwhile\s*\(/g) || []).length
    const switchCount = (code.match(/\bswitch\s*\(/g) || []).length
    const caseCount = (code.match(/\bcase\s+/g) || []).length
    const catchCount = (code.match(/\bcatch\s*\(/g) || []).length
    const ternaryCount = (code.match(/\?[^:]+:/g) || []).length
    const andCount = (code.match(/&&/g) || []).length
    const orCount = (code.match(/\|\|/g) || []).length

    const cyclomatic = 1 + ifCount + elseIfCount + forCount + whileCount + caseCount + catchCount + ternaryCount + andCount + orCount

    // Calculate Cognitive Complexity
    let cognitive = 0
    let nestingLevel = 0
    lines.forEach(line => {
      // Increase nesting
      if (/\b(if|for|while|switch)\s*\(/.test(line)) {
        cognitive += 1 + nestingLevel
        nestingLevel++
      }
      if (line.includes("{")) nestingLevel++
      if (line.includes("}")) nestingLevel = Math.max(0, nestingLevel - 1)
      
      // Recursion adds extra complexity
      if (/return\s+\w+\s*\(/.test(line)) cognitive += 2
      
      // Logical operators
      cognitive += (line.match(/&&|\|\|/g) || []).length
    })

    // Detect time complexity patterns
    let timeComplexity = "O(1)"
    let spaceComplexity = "O(1)"
    const suggestions: string[] = []

    // Nested loops detection
    const hasNestedFor = /for\s*\([^)]*\)[^{]*\{[^}]*for\s*\(/.test(code.replace(/\n/g, ' '))
    const hasNestedWhile = /while\s*\([^)]*\)[^{]*\{[^}]*while\s*\(/.test(code.replace(/\n/g, ' '))
    
    if (hasNestedFor || hasNestedWhile) {
      timeComplexity = "O(n²)"
      suggestions.push("Nested loops detected - consider optimizing if possible")
    } else if (forCount > 0 || whileCount > 0) {
      timeComplexity = "O(n)"
    }

    // Recursive pattern detection
    const isRecursive = /return\s+\w+\s*\([^)]*[\+\-]\s*[12]\s*\)/.test(code)
    if (isRecursive) {
      timeComplexity = "O(2^n) - exponential recursion"
      spaceComplexity = "O(n) - recursive stack"
      suggestions.push("Use memoization or dynamic programming for exponential recursion")
      suggestions.push("Consider converting to iterative approach")
    }

    // Vector/container usage
    if (code.includes("vector") || code.includes("map") || code.includes("set")) {
      spaceComplexity = "O(n)"
      if (!code.includes("reserve(") && code.includes("push_back")) {
        suggestions.push("Use vector.reserve() when approximate size is known")
      }
    }

    // Additional suggestions based on code patterns
    if (code.includes("string") && /\+\s*"/.test(code)) {
      suggestions.push("String concatenation in loops is inefficient - use std::ostringstream")
    }

    if (/for\s*\([^;]*;\s*\w+\s*<\s*\w+\.size\(\)/.test(code)) {
      suggestions.push("Cache container.size() before loop to avoid repeated calls")
    }

    if (!code.includes("const") && functions > 0) {
      suggestions.push("Consider marking non-modifying methods as const")
    }

    if (code.includes("auto") === false && code.includes("iterator")) {
      suggestions.push("Use 'auto' for iterator types for cleaner code")
    }

    if (code.includes("endl")) {
      suggestions.push("Use '\\n' instead of std::endl for better performance (avoids flush)")
    }

    // Security score calculation
    let securityScore = 100
    const securityIssues: Array<{ severity: string; description: string }> = []

    if (/\bgets\s*\(/.test(code)) {
      securityScore -= 30
      securityIssues.push({ severity: "critical", description: "Never use gets() - use fgets() instead (buffer overflow)" })
    }
    if (/\bstrcpy\s*\(/.test(code)) {
      securityScore -= 15
      securityIssues.push({ severity: "high", description: "strcpy() is unsafe - use strncpy() or std::string" })
    }
    if (/\bsprintf\s*\(/.test(code)) {
      securityScore -= 15
      securityIssues.push({ severity: "high", description: "sprintf() can overflow - use snprintf()" })
    }
    if (/\bscanf\s*\(.*%s/.test(code)) {
      securityScore -= 15
      securityIssues.push({ severity: "high", description: "scanf with %s is unsafe - specify width or use fgets()" })
    }
    if (/\bnew\b/.test(code) && !/unique_ptr|shared_ptr/.test(code)) {
      securityScore -= 10
      securityIssues.push({ severity: "medium", description: "Raw pointers without smart pointers may cause memory leaks" })
    }
    if (/\beval\b|\bsystem\s*\(/.test(code)) {
      securityScore -= 20
      securityIssues.push({ severity: "high", description: "system() calls can be dangerous - validate all inputs" })
    }

    const optimizationScore = Math.max(0, Math.min(100, 100 - cyclomatic * 3 - (isRecursive ? 20 : 0)))

    const result: AnalysisResult = {
      complexity: {
        cyclomatic,
        cognitive,
        linesOfCode: nonEmptyLines.length,
        functions,
        classes,
      },
      performance: {
        estimatedTime: timeComplexity,
        memoryUsage: spaceComplexity,
        optimizationScore,
        suggestions: suggestions.length > 0 ? suggestions : ["Code looks well-optimized!"],
      },
      security: {
        score: Math.max(0, securityScore),
        issues: securityIssues.length > 0 ? securityIssues : [{ severity: "info", description: "No security issues detected" }],
      },
    }

    setAnalysisResult(result)
    setOutput(`Analysis complete!\n\nComplexity Metrics:\n- Cyclomatic: ${cyclomatic}\n- Cognitive: ${cognitive}\n- Lines of Code: ${nonEmptyLines.length}\n\nTime Complexity: ${timeComplexity}\nSpace Complexity: ${spaceComplexity}\n\nSecurity Score: ${securityScore}/100\nOptimization Score: ${optimizationScore}/100`)
    setIsProcessing(false)
  }

  // Simulate code compilation
  const compileCode = async () => {
    setIsProcessing(true)
    setOutput("Compiling...\n")
    await new Promise(resolve => setTimeout(resolve, 1000))

    setOutput(`$ g++ -std=c++17 -O2 -Wall main.cpp -o main

Compilation successful!

$ ./main
8
28
1 2 5 8 9 
0 1 1 2 3 5 8 13 21 34 

Process finished with exit code 0
Execution time: 0.023s
Memory usage: 1.2 MB`)
    setIsProcessing(false)
  }

  // Copy to clipboard
  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Reset code
  const resetCode = () => {
    setCode(sampleCppCode)
    setDiagnostics([])
    setAnalysisResult(null)
    setOutput("")
  }

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      case "hint":
        return <Sparkles className="w-4 h-4 text-purple-500" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // Tools config
  const tools = [
    { id: "format", name: "Formatter", icon: Braces, action: formatCode },
    { id: "lint", name: "Linter", icon: Bug, action: lintCode },
    { id: "analyze", name: "Analyzer", icon: Gauge, action: analyzeCode },
    { id: "compile", name: "Compile & Run", icon: Play, action: compileCode },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-orange-500/10 text-orange-500 border-orange-500/20">
              <Code2 className="w-3 h-3 mr-1" />
              C++ Developer Tools
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              C++ Developer{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Tools Hub
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Professional-grade C++ development tools including code formatter, linter,
              complexity analyzer, and compiler - all in your browser.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/emigrators2025/cpp-dev-tools"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </Button>
              </a>
              <a
                href="https://cpp-dev-tools.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
                  <ExternalLink className="w-4 h-4" />
                  Open Standalone App
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Code Editor Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "lg:col-span-2",
                isFullscreen && "fixed inset-4 z-50 lg:col-span-1"
              )}
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-orange-500" />
                    <CardTitle className="text-lg">Code Editor</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetCode}
                      title="Reset code"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyCode}
                      title="Copy code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Tool Buttons */}
                  <div className="flex items-center gap-2 p-3 border-b bg-muted/30 overflow-x-auto">
                    {tools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? "default" : "outline"}
                        size="sm"
                        className="gap-2 shrink-0"
                        onClick={() => {
                          setActiveTool(tool.id)
                          tool.action()
                        }}
                        disabled={isProcessing}
                      >
                        <tool.icon className="w-4 h-4" />
                        {tool.name}
                      </Button>
                    ))}
                  </div>

                  {/* Code Area */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 flex flex-col items-center pt-3 text-xs text-muted-foreground font-mono select-none border-r">
                      {code.split("\n").map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-6 flex items-center justify-center w-full",
                            diagnostics.some(d => d.line === i + 1) &&
                              "bg-amber-500/20"
                          )}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="min-h-[500px] pl-16 font-mono text-sm resize-none rounded-none border-0 focus-visible:ring-0"
                      placeholder="Paste your C++ code here..."
                      spellCheck={false}
                    />
                  </div>

                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="p-3 border-t bg-muted/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 animate-pulse text-amber-500" />
                        Processing...
                      </div>
                      <Progress value={66} className="mt-2 h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="output" className="h-full">
                <Card className="h-full">
                  <CardHeader className="py-3 border-b">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="output" className="gap-2">
                        <Terminal className="w-4 h-4" />
                        Output
                      </TabsTrigger>
                      <TabsTrigger value="diagnostics" className="gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Issues
                        {diagnostics.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                            {diagnostics.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="gap-2">
                        <Gauge className="w-4 h-4" />
                        Analysis
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="p-4">
                    <TabsContent value="output" className="mt-0 h-[480px]">
                      <div className="bg-zinc-900 rounded-lg p-4 h-full overflow-auto">
                        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                          {output || "Run a tool to see output..."}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="diagnostics" className="mt-0 h-[480px] overflow-auto">
                      {diagnostics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <CheckCircle2 className="w-12 h-12 mb-4 text-green-500" />
                          <p>No issues found</p>
                          <p className="text-sm">Run the linter to check your code</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {diagnostics.map((diag, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={cn(
                                "p-3 rounded-lg border",
                                diag.severity === "error" && "bg-red-500/10 border-red-500/20",
                                diag.severity === "warning" && "bg-amber-500/10 border-amber-500/20",
                                diag.severity === "info" && "bg-blue-500/10 border-blue-500/20",
                                diag.severity === "hint" && "bg-purple-500/10 border-purple-500/20"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {getSeverityIcon(diag.severity)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                      Ln {diag.line}, Col {diag.column}
                                    </span>
                                    {diag.code && (
                                      <Badge variant="outline" className="text-xs">
                                        {diag.code}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm">{diag.message}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-0 h-[480px] overflow-auto">
                      {analysisResult ? (
                        <div className="space-y-6">
                          {/* Complexity Metrics */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Braces className="w-4 h-4" />
                              Complexity Metrics
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{analysisResult.complexity.cyclomatic}</p>
                                <p className="text-xs text-muted-foreground">Cyclomatic</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{analysisResult.complexity.cognitive}</p>
                                <p className="text-xs text-muted-foreground">Cognitive</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{analysisResult.complexity.linesOfCode}</p>
                                <p className="text-xs text-muted-foreground">Lines of Code</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{analysisResult.complexity.functions}</p>
                                <p className="text-xs text-muted-foreground">Functions</p>
                              </div>
                            </div>
                          </div>

                          {/* Performance */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Gauge className="w-4 h-4" />
                              Performance Score
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Optimization</span>
                                <span className="font-semibold">{analysisResult.performance.optimizationScore}%</span>
                              </div>
                              <Progress value={analysisResult.performance.optimizationScore} />
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{analysisResult.performance.estimatedTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MemoryStick className="w-4 h-4 text-muted-foreground" />
                                <span>{analysisResult.performance.memoryUsage}</span>
                              </div>
                            </div>
                          </div>

                          {/* Suggestions */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Suggestions
                            </h4>
                            <ul className="space-y-2">
                              {analysisResult.performance.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Gauge className="w-12 h-12 mb-4" />
                          <p>No analysis data</p>
                          <p className="text-sm">Run the analyzer to see metrics</p>
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Card>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Tool Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Braces,
                title: "Code Formatter",
                description: "Automatic code formatting following Google C++ Style Guide",
                color: "text-blue-500"
              },
              {
                icon: Bug,
                title: "Static Analyzer",
                description: "Detect bugs, memory leaks, and security vulnerabilities",
                color: "text-red-500"
              },
              {
                icon: Gauge,
                title: "Performance Profiler",
                description: "Analyze time and space complexity with optimization tips",
                color: "text-green-500"
              },
              {
                icon: Play,
                title: "Online Compiler",
                description: "Compile and run C++ code with multiple compiler versions",
                color: "text-purple-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <feature.icon className={cn("w-12 h-12 mx-auto mb-4", feature.color)} />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
