# Grafana Chernoff Faces Panel Plugin

A Grafana panel plugin that visualizes multivariate data using Chernoff Faces — a technique where data dimensions are mapped to facial features, exploiting humans' innate ability to recognize subtle differences in faces. The primary use case is monitoring fleets of entities (servers, services, pods, etc.) and spotting outliers at a glance by seeing which faces "look weird."

Metrics are auto-mapped to facial features in order of perceptual salience, based on the De Soete & De Corte (1985) ranking of which features humans notice changes in most readily.

## Features

- **Salience-aware auto-mapping** — most important metrics automatically mapped to most noticeable facial features
- **Z-score normalization** — mean becomes the neutral face, deviations become exaggerated features
- **Data source agnostic** — works with any Grafana data source (table or multi-series format)
- **Monochrome line drawings** — uses `currentColor` to adapt to Grafana light/dark themes
- **Grouping** — group faces by region, namespace, or any label field
- **Hover tooltips** — see raw metric values and z-scores for each entity
- **Configurable** — manual metric-to-feature mapping, z-score clamping, column layout

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   npm run dev
   ```

3. Spin up Grafana with the plugin and a provisioned demo dashboard

   ```bash
   npm run server
   ```

4. Open http://localhost:3000 — the "Chernoff Faces — Server Fleet" dashboard shows 24 servers across 4 regions with 6 outliers.

5. Run the tests

   ```bash
   npm run test:ci
   ```

## Facial Features (by salience rank)

| Rank | Feature          | Param range                              |
|------|------------------|------------------------------------------|
| 1    | Mouth curvature  | 0 = frown, 0.5 = neutral, 1 = smile     |
| 2    | Face height      | 0 = short, 0.5 = normal, 1 = tall       |
| 3    | Eye size         | 0 = tiny, 0.5 = normal, 1 = large       |
| 4    | Eyebrow slant    | 0 = angry V, 0.5 = flat, 1 = worried    |
| 5    | Nose length      | 0 = short, 0.5 = normal, 1 = long       |
| 6    | Mouth width      | 0 = narrow, 0.5 = normal, 1 = wide      |
| 7    | Face width       | 0 = narrow, 0.5 = normal, 1 = wide      |
| 8    | Eye position     | 0 = low, 0.5 = normal, 1 = high         |

## References

1. Chernoff, H. (1973). "The Use of Faces to Represent Points in k-Dimensional Space Graphically." *Journal of the American Statistical Association*, 68(342), 361-368.
2. De Soete, G. & De Corte, W. (1985). "On the Perceptual Salience of Features of Chernoff Faces for Representing Multivariate Data." *Applied Psychological Measurement*, 9(3), 275-285.
3. Chernoff, H. & Rizvi, M.H. (1975). "Effect on classification error of random permutations of features in representing multivariate data by faces." *JASA*, 70(351).
4. Flury, B. & Riedwyl, H. (1981). "Graphical Representation of Multivariate Data by Means of Asymmetrical Faces." *JASA*, 76(376).
