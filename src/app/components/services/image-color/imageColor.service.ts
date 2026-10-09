import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageColorService {

  async getAverageColor(imageUrl: string): Promise<string> {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject('Não foi possível criar o contexto do canvas');
          return;
        }

        canvas.width = 50;
        canvas.height = 50;

        ctx.drawImage(image, 0, 0, 50, 50);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const pixels = imageData.data;

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const alpha = pixels[i + 3];
          if (alpha === 0)
            continue;

          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
          count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        resolve(`rgb(${r}, ${g}, ${b})`);
      };

      image.onerror = () => {
        reject('Erro ao carregar a imagem');
      };

      image.src = imageUrl;
    });
  }
}