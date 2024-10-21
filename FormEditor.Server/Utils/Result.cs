namespace FormEditor.Server.Utils
{
    public readonly struct Result<T, E>
    {
        private readonly bool _success;
        public readonly T Value;
        public readonly E Error;

        private Result(T v, E e, bool success)
        {
            Value = v;
            Error = e;
            _success = success;
        }

        public bool IsOk => _success;
        public bool IsErr => _success;

        public static Result<T, E> Ok(T v)
        {
            return new(v, default, true);
        }

        public static Result<T, E> Err(E e)
        {
            return new(default, e, false);
        }
        public static implicit operator Result<T, E>(E e) => new(default, e, false);
        public static implicit operator Result<T, E>(T v) => new(v, default, true);
        
        public Result<TT,E> Map<TT>(Func<T, TT> mapFunc)
        {
            if (_success)
            {
               return Result<TT,E>.Ok(mapFunc(Value));
            }
            else
            {
                return Result<TT,E>.Err(Error);
            }
        }  

        public void Match(
                Action<T> success,
                Action<E> failure)
        {
            if (_success) success(Value); else failure(Error);
        }  
    }
    
    public readonly struct Result<E>
    {
        private readonly bool _success;
        public readonly E Error;

        private Result(E e, bool success)
        {
            Error = e;
            _success = success;
        }

        public bool IsOk => _success;
        public bool IsErr => _success;

        public static Result<E> Ok()
        {
            return new(default, true);
        }

        public static Result<E> Err(E e)
        {
            return new( e, false);
        }
        public static implicit operator Result<E>(E e) => new(e, false);
        
        
    }
}




