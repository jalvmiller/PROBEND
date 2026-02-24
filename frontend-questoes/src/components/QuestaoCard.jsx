import React from 'react';

export default function QuestaoCard({ dados }) {

    // Dificuldade -> 0, 1, 2
    const coresDificuldade = ["text-green-600", "text-yellow-600", "text-red-600"];
    const rotulosDificuldade = ["Fácil", "Média", "Difícil"];

    // borderRadius (JS) ao invés de border-radius (CSS), devido ao React.. lidamos com objetos JS
    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            margin: '10px 0',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
            

            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between'
                }}>
                    <strong style={{color: '#555'}}> {dados.materia} </strong>
                    <span className={coresDificuldade[dados.dificuldade]} style={{fontWeight: 'bold'}}>

                        {rotulosDificuldade[dados.dificuldade]}

                    </span>
            </div>


            <p style={{ margin: '15px 0', fontSize: '1.1rem' }}>{dados.enunciado}</p>


            <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                <p><strong>Alternativa:</strong> {dados.alternativas}</p>
            </div>


            {dados.fonte && (
                <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
                    Fonte: {dados.fonte}
                </small>
            )}
            

        </div>
    );
}