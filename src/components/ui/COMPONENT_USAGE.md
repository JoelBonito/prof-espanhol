# UI Components - Dark Premium Design System

Componentes base do Elite Español seguindo o design system dark premium glassmorphism.

## Card Component

### Variantes

- **glass** (default): Glass panel com backdrop blur
- **premium**: Glass panel com border orange e glow
- **solid**: Background sólido escuro
- **interactive**: Glass panel com hover effects

### Uso

```tsx
import { Card } from '@/components/ui/Card';

// Glass panel (default)
<Card>Conteúdo</Card>

// Premium card com glow
<Card variant="premium">Destaque importante</Card>

// Card interativo
<Card variant="interactive" onClick={handleClick}>
  Card clicável
</Card>

// Com status border
<Card status="success">Operação concluída</Card>
```

---

## Button Component

### Variantes

- **primary**: Gradient laranja com glow shadow
- **secondary**: Glass background com border
- **ghost**: Transparente, hover com glass effect
- **outline**: Border apenas, hover fill

### Tamanhos

- **sm**: 8px altura
- **default**: 10px altura
- **lg**: 52px altura

### Uso

```tsx
import { Button } from '@/components/ui/Button';

// Primary com gradient e glow
<Button variant="primary">Começar agora</Button>

// Secondary glass
<Button variant="secondary">Cancelar</Button>

// Ghost para ações sutis
<Button variant="ghost">Ver detalhes</Button>

// Outline
<Button variant="outline">Mais opções</Button>

// Com loading state
<Button isLoading>Salvando...</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="lg">Grande</Button>
```

---

## Badge Component

### Variantes

- **default**: Glass neutro
- **success**: Verde com glow (sucesso)
- **warning**: Amarelo com glow (atenção)
- **error**: Vermelho com glow (erro)
- **primary**: Laranja com glow (destaque)
- **info**: Azul com glow (informação)
- **streak**: Badge de streak com ícone de fogo
- **level**: Badge grande de nível

### Uso

```tsx
import { Badge } from '@/components/ui/Badge';

// Default neutro
<Badge variant="default">Novo</Badge>

// Status com glow
<Badge variant="success">Concluído</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="error">Erro</Badge>

// Primary com glow laranja
<Badge variant="primary">Destaque</Badge>

// Streak (com ícone)
<Badge variant="streak">5 dias</Badge>

// Level (grande)
<Badge variant="level">B2</Badge>
```

---

## Input Component

### Features

- Background glass com blur
- Focus laranja com glow
- Password toggle automático
- Error states
- Acessível (ARIA labels)

### Uso

```tsx
import { Input } from '@/components/ui/Input';

// Básico
<Input placeholder="Digite seu nome" />

// Com label
<Input label="Email" type="email" />

// Password (toggle automático)
<Input label="Senha" type="password" />

// Com erro
<Input 
  label="Email" 
  error="Email inválido" 
  value={email}
/>

// Disabled
<Input label="Campo bloqueado" disabled />
```

---

## Modal Component

### Features

- Overlay escuro com blur
- Premium card styling
- Animação scale-in
- ESC para fechar
- Focus trap
- Acessível (ARIA)

### Tamanhos

- **sm**: max-w-sm
- **default**: max-w-lg
- **lg**: max-w-2xl

### Uso

```tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir modal
      </Button>
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmar ação"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja continuar?</p>
      </Modal>
    </>
  );
}

// Tamanhos
<Modal size="sm">Pequeno</Modal>
<Modal size="lg">Grande</Modal>
```

---

## Design Tokens Utilizados

Todos os componentes usam as CSS variables do design system:

```css
/* Cores */
--color-app-bg: #0B101B
--color-surface-dark: #121926
--color-primary-500: #FF8C42
--color-glass-bg: rgba(18, 24, 38, 0.6)
--color-border-default: rgba(255, 255, 255, 0.1)
--color-text-primary: #FFFFFF
--color-text-secondary: #94A3B8

/* Efeitos */
--shadow-glow-orange: 0 0 15px rgba(255, 140, 66, 0.3)
--radius-default: 12px
--radius-xl: 28px
--duration-default: 200ms

/* Utilitários */
.glass-panel - Glass background com blur
.premium-card - Premium glass com glow
.glow-badge - Badge laranja com glow
```

---

## Acessibilidade

Todos os componentes seguem as melhores práticas de acessibilidade:

- ARIA labels apropriados
- Keyboard navigation
- Focus management
- Touch targets mínimos (44x44px)
- Contraste adequado (WCAG AA)
- Screen reader friendly
- Reduced motion support

---

## Exemplos de Composição

### Card com Badge e Button

```tsx
<Card variant="premium">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">Lição Diária</h3>
    <Badge variant="primary">Novo</Badge>
  </div>
  <p className="text-[var(--color-text-secondary)] mb-4">
    Complete sua lição de hoje
  </p>
  <Button>Começar</Button>
</Card>
```

### Form com Inputs

```tsx
<form onSubmit={handleSubmit}>
  <Input 
    label="Nome completo" 
    placeholder="João Silva"
    required
  />
  <Input 
    label="Email" 
    type="email"
    placeholder="joao@email.com"
    required
  />
  <Input 
    label="Senha" 
    type="password"
    required
  />
  <Button type="submit" isLoading={loading}>
    Criar conta
  </Button>
</form>
```

---

## Performance

- Componentes otimizados com forwardRef quando necessário
- Uso de CSS variables (sem re-render no tema)
- Animações GPU-accelerated (transform, opacity)
- Bundle size mínimo
- Tree-shakeable

---

## Manutenção

Para adicionar novos componentes, siga:

1. Use TypeScript com interfaces
2. Aplique design tokens (CSS variables)
3. Suporte dark mode
4. Garanta acessibilidade (ARIA)
5. Adicione props `className` para composição
6. Documente variantes e uso
