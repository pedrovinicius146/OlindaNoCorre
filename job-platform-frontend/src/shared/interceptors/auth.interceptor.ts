// src/app/shared/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Se for exatamente a listagem de áreas (sem query string nem nada), não anexa token
  // Exemplo de url que casa: http://localhost:8000/api/areas-atuacao/
  if (/\/api\/areas-atuacao\/?$/.test(url)) {
    return next(req);
  }

  // Para TODAS as outras requisições, anexa o Authorization
  const token = localStorage.getItem('token');
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Sem token, manda mesmo assim (vai receber 401 nos endpoints protegidos)
  return next(req);
};
