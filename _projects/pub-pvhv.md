---
layout: project
title: 'Potentially Visible Hidden-Volume Rendering for Multi-View Warping'
caption: ACM Trans. Graphics (Proc. SIGGRAPH), 42(4), 86:1-11, 2023.
description: >
    (Submitted) Jan. 25, (Accepted) Apr. 28, (Published) Jul. 26, 2023, IF=6.2, PCTL=90.3. ISSN=0730-0301, ACM, USA
date: 26 Jul 2023
image: 
  path: /assets/img/projects/pvhv.jpg
  srcset: 
    1920w: /assets/img/projects/pvhv.jpg
    960w:  /assets/img/projects/pvhv.jpg
    480w:  /assets/img/projects/pvhv.jpg
links:
  - title: Link
    url: https://dl.acm.org/doi/abs/10.1145/3592108
accent_color: '#4fb1ba'
accent_image:
  background: '#193747'
theme_color: '#193747'
sitemap: false
---

This paper presents the model and rendering algorithm of Potentially Visible Hidden Volumes (PVHVs) for multi-view image warping. 

PVHVs are 3D volumes that are occluded at a known source view, but potentially visible at novel views. Given a bound of novel views, we define PVHVs using the edges of foreground fragments from the known view and the bound of novel views.

PVHVs can be used to batch-test the visibilities of source fragments without iterating individual novel views in multi-fragment rendering, and thereby, cull redundant fragments prior to warping.

We realize the model of PVHVs in Depth Peeling (DP). Our Effective Depth Peeling (EDP) can reduce the number of completely hidden fragments, capture important fragments early, and reduce warping cost.

We demonstrate the benefit of our PVHVs and EDP in terms of memory, quality, and performance in multi-view warping.

[paper](https://cg.skku.edu/pub/papers/2023-kim-siggraph-pvhv-cam.pdf), [slide](https://cg.skku.edu/pub/papers/2023-kim-siggraph-pvhv-slides.pdf), 
[code](https://github.com/cgskku/pvhv)

<!-- ```yml
google_fonts: false
font:         false
font_heading: false
font_code:    false
```

The configuration I use to enable the system font on my site. Feel free to copy!
{:.figcaption} -->
