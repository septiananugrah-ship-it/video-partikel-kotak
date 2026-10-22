#!/usr/bin/env python3
"""Simulasi paket gelombang elektron menembus penghalang (Bab 09).

Persamaan Schrödinger bergantung waktu diselesaikan dengan metode split-operator (FFT),
massa elektron, E₀ = 1 eV, V₀ = 5 eV, lebar 0,20 nm (Contoh 11 Modul 3).
Hasil: src/data/packet.json — |ψ|² pada kisi tampilan + peluang tembus terhadap waktu.
"""
import json
from pathlib import Path
import numpy as np

HBAR = 1.054571817e-34
ME = 9.1093837015e-31
EV = 1.602176634e-19
NM = 1e-9
FS = 1e-15

N = 8192
L = 120.0  # nm
x = (np.arange(N) - N // 2) * (L / N)  # nm
dx = L / N
E0, V0, D = 1.0, 5.0, 0.20
k0 = np.sqrt(2 * ME * E0 * EV) / HBAR * NM  # nm⁻¹
sigma = 2.0  # nm (lebar paket, sebaran energi kecil)
x0 = -16.0
V = np.where((x >= 0) & (x <= D), V0, 0.0)
psi = np.exp(-((x - x0) ** 2) / (4 * sigma**2) + 1j * k0 * x)
psi /= np.sqrt(np.sum(np.abs(psi) ** 2) * dx)

k = 2 * np.pi * np.fft.fftfreq(N, d=dx)  # nm⁻¹
dt = 0.004  # fs
T_kin = np.exp(-1j * (HBAR * (k / NM) ** 2 / (2 * ME)) * dt * FS)
V_half = np.exp(-1j * (V * EV / HBAR) * dt * FS / 2)

t_end = 50.0  # fs
n_steps = int(t_end / dt)
frames = 200
every = n_steps // frames
xs_show = np.linspace(-22, 22, 661)
idx = np.searchsorted(x, xs_show)
out = {'x0': -22, 'x1': 22, 'n': len(xs_show), 'dtFs': every * dt, 'k0': float(k0), 'rho': [], 'P': [], 'Re': []}
for s in range(n_steps + 1):
    if s % every == 0 and len(out['rho']) < frames:
        rho = np.abs(psi) ** 2
        out['rho'].append([round(float(v), 4) for v in rho[idx]])
        out['Re'].append([round(float(v), 3) for v in psi.real[idx]])
        out['P'].append(round(float(np.sum(rho[x > D]) * dx), 5))
    psi = V_half * np.fft.ifft(T_kin * np.fft.fft(V_half * psi))
print('k0 =', k0, 'nm^-1 · P_tembus akhir =', out['P'][-1], '· maks rho awal =', max(out['rho'][0]))
Path(__file__).resolve().parent.parent.joinpath('src/data/packet.json').write_text(json.dumps(out, separators=(',', ':')))
