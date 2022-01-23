local z = ...

local function fh(h)
	return (h:gsub('..', function (c)
		return string.char(tonumber(c, 16))
	end))
end

local function th(h)
	return (h:gsub('.', function (c)
		return string.format('%02X', string.byte(c))
	end))
end

return function(co, p)
	package.loaded[z] = nil
	z = nil
	local re = ""
	local t = tmr.create()
	uart.on("data", 1, function(c)
		t:stop()
		re = re..c
		t:alarm(4, 0, function()
			uart.on("data")
			collectgarbage()
			require("rs")(co, 200, node.heap().."\n"..th(re))
		end)
	end, 0)
	gpio.write(3, gpio.HIGH)
	local s = fh(p.cmd)
	uart.write(0, s)
	t:alarm(1000, 0, function()
		uart.on("data")
		collectgarbage()
		require("rs")(co, 200, node.heap().."\n")
	end)
	tmr.create():alarm((#s * 100) / 96 + 1, 0, function() gpio.write(3, gpio.LOW) end)
end

