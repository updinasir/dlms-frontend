import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, ArrowLeft, UserRound, IdCardLanyard, BadgeCheck, CalendarDays, QrCode, Camera, ScanLine, X, Upload } from 'lucide-react'
import jsQR from 'jsqr'
import api from '../../api/axios'
import { resolveUploadSrc } from '../../utils/media'

const SearchDriver = () => {
  const [nationalId, setNationalId] = useState('')
  const [driver, setDriver] = useState(null)
  const [license, setLicense] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanMessage, setScanMessage] = useState('')
  const [searchMode, setSearchMode] = useState('national-id')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)
  const scanActiveRef = useRef(false)
  const uploadInputRef = useRef(null)
  const uploadCanvasRef = useRef(null)

  const handleSearch = async () => {
    const searchValue = nationalId.trim()

    if (!searchValue) {
      setError('Please enter a national ID to search.')
      setDriver(null)
      setLicense(null)
      return
    }

    setError('')
    setDriver(null)
    setLicense(null)
    setLoading(true)

    try {
      const [driverResponse, licenseResponse] = await Promise.all([
        api.get(`/drivers/public/search/${encodeURIComponent(searchValue)}?exact=true`),
        api.get(`/licenses/public/search/${encodeURIComponent(searchValue)}`)
      ])

      const foundDrivers = driverResponse.data.drivers || []
      const foundLicenses = licenseResponse.data.licenses || []

      if (!foundDrivers.length) {
        setError('No driver found with that national ID.')
        return
      }

      setDriver(foundDrivers[0])
      setLicense(foundLicenses[0] || null)
    } catch (err) {
      setError('Unable to search for the driver. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getVehicleType = (categoryId) => {
    const categories = {
      1: 'Motorcycle / Light Vehicle',
      2: 'Private Car / Sedan',
      3: 'Heavy Vehicle / Bus'
    }

    return categories[Number(categoryId)] || `Category ${categoryId || 'N/A'}`
  }

  const resolvePhotoSrc = resolveUploadSrc

  const stopScanner = () => {
    scanActiveRef.current = false

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
  }

  const attachStreamToVideo = async (stream) => {
    const video = videoRef.current

    if (!video) {
      return false
    }

    video.srcObject = stream

    try {
      await video.play()
    } catch {
    }

    return true
  }

  const startScanLoop = () => {
    const scanFrame = async () => {
      if (!videoRef.current || !scanActiveRef.current) {
        return
      }

      try {
        const video = videoRef.current
        const canvas = uploadCanvasRef.current || document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })

        if (context && video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const scannedCode = jsQR(imageData.data, imageData.width, imageData.height)

          if (scannedCode?.data) {
            await handleScanResult(scannedCode.data)
            return
          }
        }

        animationFrameRef.current = requestAnimationFrame(scanFrame)
      } catch {
        animationFrameRef.current = requestAnimationFrame(scanFrame)
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame)
  }

  const loadLicenseFromQR = async (licenseNumber) => {
    setScanLoading(true)
    setScanError('')
    setError('')

    try {
      const response = await api.get(`/licenses/verify/${encodeURIComponent(licenseNumber)}`)
      const foundLicense = response.data.license

      if (!foundLicense) {
        setScanError('QR scanned, but no license was returned.')
        return
      }

      setDriver({
        first_name: foundLicense.driver_name?.split(' ')?.[0] || 'Unknown',
        last_name: foundLicense.driver_name?.split(' ')?.slice(1).join(' ') || '',
        national_id: foundLicense.national_id || 'N/A',
        photo: foundLicense.photo || null,
        status: foundLicense.license_status || 'Verified',
        email: foundLicense.email || 'N/A',
        city: foundLicense.city || 'N/A',
        registration_date: foundLicense.issue_date || null
      })
      setLicense(foundLicense)
      setNationalId(foundLicense.national_id || licenseNumber)
      setScanMessage(`QR verified: ${licenseNumber}`)
    } catch (err) {
      setScanError('Could not verify the scanned QR code.')
    } finally {
      setScanLoading(false)
    }
  }

  const loadDriverFromQR = async (driverId) => {
    setScanLoading(true)
    setScanError('')
    setError('')

    try {
      const response = await api.get(`/drivers/verify/${encodeURIComponent(driverId)}`)
      const verifiedDriver = response.data.driver

      if (!verifiedDriver) {
        setScanError('QR scanned, but no driver record was found.')
        return
      }

      setDriver(verifiedDriver)
      setLicense(null)
      setNationalId(verifiedDriver.national_id || '')
      setScanMessage(`Driver verified: ${verifiedDriver.full_name}`)
    } catch (err) {
      setScanError('Could not verify the scanned driver QR code.')
    } finally {
      setScanLoading(false)
    }
  }

  const handleScanResult = async (rawValue) => {
    const text = String(rawValue || '').trim()

    if (!text) {
      return
    }

    // Support driver verification URLs from driver QR code
    const driverVerifyMatch = text.match(/\/verify\/driver\/(\d+)$/)
    if (driverVerifyMatch) {
      stopScanner()
      await loadDriverFromQR(driverVerifyMatch[1])
      return
    }

    let parsedValue = text
    try {
      const parsed = JSON.parse(text)
      parsedValue = parsed.license_number || parsed.licenseNumber || text
    } catch {
      // plain text QR content is supported as well
    }

    if (parsedValue) {
      stopScanner()
      await loadLicenseFromQR(parsedValue)
    }
  }

  const startScanner = async () => {
    setScanError('')
    setScanMessage('')
    setIsScanning(true)

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('Camera scanning is not supported in this browser.')
      setIsScanning(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        },
        audio: false
      })
      streamRef.current = stream

      await attachStreamToVideo(stream)

      scanActiveRef.current = true
      startScanLoop()
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        streamRef.current = fallbackStream

        await attachStreamToVideo(fallbackStream)

        scanActiveRef.current = true
        startScanLoop()
      } catch {
        setScanError('Camera access was denied or is not available.')
        stopScanner()
      }
    }
  }

  const detectQrFromImage = async (imageSource) => {
    const canvas = uploadCanvasRef.current || document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (!context) {
      throw new Error('Canvas is not available')
    }

    const width = imageSource.width || imageSource.videoWidth
    const height = imageSource.height || imageSource.videoHeight

    if (!width || !height) {
      throw new Error('Image has no readable dimensions')
    }

    canvas.width = width
    canvas.height = height
    context.drawImage(imageSource, 0, 0, width, height)

    const imageData = context.getImageData(0, 0, width, height)
    const scannedCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (!scannedCode?.data) {
      throw new Error('No QR code found')
    }

    await handleScanResult(scannedCode.data)
  }

  const handleUploadQr = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setScanError('')
    setScanMessage('')
    stopScanner()

    try {
      setScanLoading(true)

      const objectUrl = URL.createObjectURL(file)
      try {
        const image = await new Promise((resolve, reject) => {
          const loadedImage = new Image()
          loadedImage.onload = () => resolve(loadedImage)
          loadedImage.onerror = reject
          loadedImage.src = objectUrl
        })

        await detectQrFromImage(image)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    } catch (err) {
      setScanError('Could not read a QR code from the uploaded image.')
    } finally {
      setScanLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Search Driver</p>
                <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">National ID Lookup</h1>
              </div>
            </div>

            <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => setSearchMode('national-id')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${searchMode === 'national-id' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Search with National ID
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('qr')}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${searchMode === 'qr' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Scan Driver QR
            </button>
          </div>

          {searchMode === 'national-id' ? (
            <>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter a national ID to search a driver and view the matched license summary.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">National ID</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. SOM-1234567895"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />

                {nationalId.trim() && (
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 text-sm font-semibold text-black shadow-[0_14px_28px_rgba(59,130,246,0.24)] transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Search className="h-4 w-4" />
                    {loading ? 'Searchingâ€¦' : 'Search'}
                  </button>
                )}

                {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Scan the driver QR code with your camera or upload a screenshot/photo of it to verify the driver.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">QR Scan</p>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900">Scan driver QR</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isScanning ? (
                      <button
                        type="button"
                        onClick={startScanner}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Camera className="h-4 w-4" />
                        Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopScanner}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" />
                        Stop
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>

                    <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleUploadQr} className="hidden" />
                  </div>
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  {isScanning ? (
                    <div className="relative aspect-[4/3] bg-black">
                      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-44 w-44 rounded-[28px] border-2 border-white/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.18)]">
                          <div className="flex h-full items-start justify-end p-3 text-white/90">
                            <ScanLine className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-8 text-center text-slate-500">
                      <QrCode className="h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-700">Camera scanner is ready</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Open the camera, point it at the QR on the license, and the result will load here.</p>
                    </div>
                  )}
                </div>

                {scanLoading && <p className="mt-3 text-sm text-sky-600">Verifying scanned QR...</p>}
                {scanMessage && <p className="mt-3 text-sm text-emerald-600">{scanMessage}</p>}
                {scanError && <p className="mt-3 text-sm text-rose-600">{scanError}</p>}
              </div>
            </>
          )}

          {driver && (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                  {resolvePhotoSrc(driver.photo) ? (
                    <img src={resolvePhotoSrc(driver.photo)} alt="Driver photo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <UserRound className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver'}
                    </h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${driver.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {driver.status || 'Unknown'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">National ID: {driver.national_id || 'N/A'}</p>
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <UserRound className="h-3.5 w-3.5" />
                    Email / Phone
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{driver.email || driver.phone || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    City
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{driver.city || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {driver.date_of_birth ? 'Date of Birth' : 'Registered'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {(driver.date_of_birth
                      ? new Date(driver.date_of_birth).toLocaleDateString()
                      : driver.registration_date
                        ? new Date(driver.registration_date).toLocaleDateString()
                        : null) || 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <IdCardLanyard className="h-3.5 w-3.5" />
                    License #
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{license?.license_number || 'N/A'}</p>
                </div>
                {driver.gender && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Gender</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{driver.gender}</p>
                  </div>
                )}
                {driver.blood_group && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Blood Group</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{driver.blood_group}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BadgeCheck className="h-4 w-4 text-sky-600" />
                  License Summary
                </p>

                {license ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{license.license_status || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Issue Date</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{license.issue_date ? new Date(license.issue_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Expiry Date</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Vehicle Type</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{getVehicleType(license.category_id)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No license found for this national ID.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchDriver

