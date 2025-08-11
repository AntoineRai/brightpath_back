// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);
  
  // Erreur de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      status: 429,
      retryAfter: err.retryAfter || 60,
      limit: err.limit,
      windowMs: err.windowMs
    });
  }
  
  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.message,
      status: 400
    });
  }
  
  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      status: 400
    });
  }
  
  // Erreur de taille de payload
  if (err.status === 413) {
    return res.status(413).json({
      error: 'Payload trop volumineux',
      status: 413,
      maxSize: '10MB'
    });
  }
  
  // Erreur de type de contenu
  if (err.status === 415) {
    return res.status(415).json({
      error: 'Type de contenu non supporté',
      status: 415
    });
  }
  
  // Erreur par défaut
  const statusCode = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
};

module.exports = errorHandler; 