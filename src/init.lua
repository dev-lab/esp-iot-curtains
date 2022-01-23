ls = ""
cf = {}
tmr.create():alarm(2000, 0, function()
	if not cjson then _G.cjson = sjson end
	gpio.mode(3, gpio.OUTPUT)
	gpio.write(3, gpio.LOW)
	uart.setup(0, 9600, 8, 0, 1, 0)
	uart.write(0, "\n\n")
	require("connect")(function()
		tmr.create():alarm(100, 0, function()
			require("http")
			require("dnsLiar")
		end)
	end)
end)
