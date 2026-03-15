'use client'

import { useState, useMemo } from 'react'

export default function CalculatorPage() {
  const [baseDailyRate] = useState(3893.50)
  const [correctionFactor, setCorrectionFactor] = useState(1.0)
  const [numberOfShifts, setNumberOfShifts] = useState(1)
  const [holidayPayRate] = useState(12.5)
  const [bSkatRate, setBSkatRate] = useState(55)
  const [hoursPerShift, setHoursPerShift] = useState(8)

  const calculations = useMemo(() => {
    const hourlyRate = baseDailyRate / 8
    const adjustedDailyRate = (hourlyRate * hoursPerShift) * correctionFactor
    const totalBeforeHoliday = adjustedDailyRate * numberOfShifts
    const holidayPay = totalBeforeHoliday * (holidayPayRate / 100)
    const totalBeforeTax = totalBeforeHoliday + holidayPay
    const taxAmount = totalBeforeTax * (bSkatRate / 100)
    const totalAfterTax = totalBeforeTax - taxAmount

    return {
      hourlyRate,
      adjustedDailyRate,
      totalBeforeHoliday,
      holidayPay,
      totalBeforeTax,
      taxAmount,
      totalAfterTax,
    }
  }, [baseDailyRate, correctionFactor, numberOfShifts, holidayPayRate, bSkatRate, hoursPerShift])

  function formatDKK(amount: number): string {
    return amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Lonberegner</h1>
      <p className="text-gray-500 text-sm mb-6">Beregn din lon baseret pa PLO/PLA overenskomst</p>

      {/* Input section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900">Indtastning</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Basistakst (per 8 timer)
            </label>
            <div className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm">
              {formatDKK(baseDailyRate)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timer per vagt
            </label>
            <input
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={hoursPerShift}
              onChange={(e) => setHoursPerShift(parseFloat(e.target.value) || 8)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Korrektionsfaktor
            </label>
            <input
              type="number"
              min={0.1}
              max={5.0}
              step={0.01}
              value={correctionFactor}
              onChange={(e) => setCorrectionFactor(parseFloat(e.target.value) || 1)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Standard: 1.0. Juster for aften/nat/weekend</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antal vagter
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={numberOfShifts}
              onChange={(e) => setNumberOfShifts(parseInt(e.target.value) || 1)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ferietillaeg
            </label>
            <div className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm">
              {holidayPayRate}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              B-skat (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={bSkatRate}
              onChange={(e) => setBSkatRate(parseFloat(e.target.value) || 55)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Standard B-skat: 55%</p>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 mb-4">Beregning</h2>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Timesats (basis)</span>
            <span className="text-gray-900">{formatDKK(calculations.hourlyRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Dagstakst (justeret, {hoursPerShift} timer x {correctionFactor})</span>
            <span className="text-gray-900">{formatDKK(calculations.adjustedDailyRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({numberOfShifts} {numberOfShifts === 1 ? 'vagt' : 'vagter'})</span>
            <span className="text-gray-900">{formatDKK(calculations.totalBeforeHoliday)}</span>
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ferietillaeg ({holidayPayRate}%)</span>
            <span className="text-green-600">+ {formatDKK(calculations.holidayPay)}</span>
          </div>

          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900">Total for skat</span>
            <span className="text-gray-900">{formatDKK(calculations.totalBeforeTax)}</span>
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">B-skat ({bSkatRate}%)</span>
            <span className="text-red-600">- {formatDKK(calculations.taxAmount)}</span>
          </div>

          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
            <span className="text-gray-900">Udbetalt (estimat)</span>
            <span className="text-green-700">{formatDKK(calculations.totalAfterTax)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Beregningen er vejledende og baseret pa PLO/PLA overenskomst. Faktisk lon kan variere afhangigt af individuelle aftaler, tillaeg og skatteforhold. Kontakt din revisor for praecise beregninger.
        </p>
      </div>
    </div>
  )
}
