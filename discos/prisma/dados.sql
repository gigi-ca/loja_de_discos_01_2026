
USE loja_discos_db;

INSERT INTO Usuario (nome, email, senha) VALUES
('Ana Maria', 'ana@email.com', '123456'),
('Joao Silva', 'joao@email.com', '123456'),
('Pietra Fernandes', 'pietra@email.com', '123456'),
('Lucas Oliveira', 'lucas@email.com', '123456'),
('Mariana Costa', 'mariana@email.com', '123456');

INSERT INTO Disco (titulo, artista, precoCusto, quantidade, estoqueMinimo) VALUES
('Thriller', 'Michael Jackson', 120.00, 15, 5),
('Abbey Road', 'The Beatles', 150.00, 10, 4),
('The Dark Side of the Moon', 'Pink Floyd', 180.00, 8, 3),
('Rumours', 'Fleetwood Mac', 130.00, 12, 5),
('Back in Black', 'AC/DC', 110.00, 20, 6),
('Nevermind', 'Nirvana', 140.00, 7, 4),
('1989', 'Taylor Swift', 160.00, 10, 5),
('AM', 'Arctic Monkeys', 125.00, 9, 4),
('Born to Die', 'Lana Del Rey', 155.00, 6, 3),
('Future Nostalgia', 'Dua Lipa', 135.00, 14, 5);

INSERT INTO Movimentacao (tipo, quantidade, data, usuarioId, discoId) VALUES
('REPOSICAO', 5, '2026-10-01 09:00:00', 1, 1),
('VENDA', 2, '2026-10-02 10:30:00', 2, 2),
('VENDA', 3, '2026-10-03 11:00:00', 3, 3),
('REPOSICAO', 10, '2026-10-04 14:00:00', 4, 4),
('VENDA', 4, '2026-10-05 15:30:00', 5, 5),
('VENDA', 2, '2026-10-06 09:45:00', 1, 6),
('REPOSICAO', 6, '2026-10-07 13:00:00', 2, 7),
('VENDA', 3, '2026-10-08 16:00:00', 3, 8),
('VENDA', 2, '2026-10-09 10:00:00', 4, 9),
('REPOSICAO', 8, '2026-10-10 11:30:00', 5, 10);
